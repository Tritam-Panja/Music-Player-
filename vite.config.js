import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite plugin to provide zero-CORS local YouTube search and suggestions in dev mode
function youtubeSearchPlugin() {
  let YouTube;

  const searchYouTube = async (q, type = 'video') => {
    if (YouTube) {
      try {
        const results = await YouTube.search(q, {
          limit: 25,
          type: type === 'playlist' ? 'playlist' : 'video'
        });

        if (Array.isArray(results) && results.length > 0) {
          return results.map(item => ({
            id: item.id,
            type: item.type || (item.videos ? 'playlist' : 'video'),
            title: item.title,
            artist: item.channel?.name || 'Unknown Artist',
            duration: item.duration ? Math.floor(item.duration / 1000) : 0,
            thumbnail: item.thumbnail?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
            views: item.views || 0,
            uploaded: item.uploadedAt || ''
          }));
        }
      } catch (err) {
        // Fallback to Innertube if youtube-sr encounters parsing errors (e.g. browseId on channel/shorts)
      }
    }

    try {
      const response = await fetch('https://www.youtube.com/youtubei/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          context: { client: { clientName: 'WEB', clientVersion: '2.20240101.00.00' } },
          query: q
        })
      });

      if (response.ok) {
        const data = await response.json();
        const sections = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
        const tracks = [];

        for (const section of sections) {
          const items = section.itemSectionRenderer?.contents || [];
          for (const item of items) {
            const vr = item.videoRenderer;
            if (vr && vr.videoId && vr.title?.runs?.[0]?.text) {
              const thumb = vr.thumbnail?.thumbnails?.[vr.thumbnail.thumbnails.length - 1]?.url;
              tracks.push({
                id: vr.videoId,
                type: 'video',
                title: vr.title.runs[0].text,
                artist: vr.ownerText?.runs?.[0]?.text || 'Unknown Artist',
                duration: 210,
                thumbnail: thumb || `https://i.ytimg.com/vi/${vr.videoId}/hqdefault.jpg`,
                views: 0,
                uploaded: vr.publishedTimeText?.simpleText || ''
              });
            }
          }
        }

        if (tracks.length > 0) return tracks;
      }
    } catch {}

    return [];
  };

  const handleApiRequest = async (req, res, next) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Lazy load youtube-sr on first search request
    if (!YouTube && (url.pathname === '/api/search' || url.pathname === '/api/trending')) {
      const mod = await import('youtube-sr');
      YouTube = mod.YouTube || mod.default;
    }

    // 1. Search endpoint: /api/search?q=...&type=...
    if (url.pathname === '/api/search') {
      const q = url.searchParams.get('q');
      const type = url.searchParams.get('type') || 'video';
      if (!q) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Query parameter "q" is required' }));
      }

      try {
        const formatted = await searchYouTube(q, type);
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true, results: formatted }));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: err.message, results: [] }));
      }
    }

    // 2. Suggestions endpoint: /api/suggestions?q=...
    if (url.pathname === '/api/suggestions') {
      const q = url.searchParams.get('q');
      if (!q) {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ suggestions: [] }));
      }

      try {
        const response = await fetch(
          `https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&hl=en&gl=us&ds=yt&q=${encodeURIComponent(q)}`
        );
        const text = await response.text();
        const jsonMatch = text.match(/^[^(]*\((.*)\);?$/);
        let suggestions = [];
        if (jsonMatch && jsonMatch[1]) {
          const data = JSON.parse(jsonMatch[1]);
          if (Array.isArray(data[1])) {
            suggestions = data[1].map(item => item[0]).filter(Boolean);
          }
        }

        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ suggestions }));
      } catch (err) {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ suggestions: [] }));
      }
    }

    // 3. Trending / Top Charts endpoint: /api/trending
    if (url.pathname === '/api/trending') {
      try {
        const formatted = await searchYouTube('Top Global Hits 2026', 'video');
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true, results: formatted }));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: err.message, results: [] }));
      }
    }

    next();
  };

  return {
    name: 'youtube-search-api',
    configureServer(server) {
      server.middlewares.use(handleApiRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleApiRequest);
    }
  };
}

export default defineConfig({
  plugins: [react(), youtubeSearchPlugin()],
  base: './',
  server: {
    port: 5173,
    host: true
  }
});
