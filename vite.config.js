import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite plugin to provide zero-CORS local YouTube search and suggestions in dev mode
function youtubeSearchPlugin() {
  let YouTube;

  return {
    name: 'youtube-search-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);

        // Lazy load youtube-sr on first search request in dev mode
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
            const results = await YouTube.search(q, {
              limit: 25,
              type: type === 'playlist' ? 'playlist' : 'video'
            });

            const formatted = results.map(item => ({
              id: item.id,
              type: item.type || (item.videos ? 'playlist' : 'video'),
              title: item.title,
              artist: item.channel?.name || 'Unknown Artist',
              duration: item.duration ? Math.floor(item.duration / 1000) : 0,
              thumbnail: item.thumbnail?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
              views: item.views || 0,
              uploaded: item.uploadedAt || ''
            }));

            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, results: formatted }));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
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
            const results = await YouTube.search('Top Global Hits 2026', { limit: 20, type: 'video' });
            const formatted = results.map(item => ({
              id: item.id,
              type: 'video',
              title: item.title,
              artist: item.channel?.name || 'Top Artist',
              duration: item.duration ? Math.floor(item.duration / 1000) : 0,
              thumbnail: item.thumbnail?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
              views: item.views || 0,
              uploaded: item.uploadedAt || ''
            }));

            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, results: formatted }));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        }

        next();
      });
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
