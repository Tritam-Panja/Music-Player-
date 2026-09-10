import { YouTube } from 'youtube-sr';

export default async (req) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q');
  const type = url.searchParams.get('type') || 'video';

  if (!q) {
    return new Response(JSON.stringify({ error: 'Query parameter "q" is required', results: [] }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 1. Try youtube-sr
  try {
    const results = await YouTube.search(q, {
      limit: 25,
      type: type === 'playlist' ? 'playlist' : 'video'
    });

    if (Array.isArray(results) && results.length > 0) {
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

      return new Response(JSON.stringify({ success: true, results: formatted }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    // Fallback to Innertube API
  }

  // 2. Direct YouTube Innertube search fallback
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

      if (tracks.length > 0) {
        return new Response(JSON.stringify({ success: true, results: tracks }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  } catch (err) {
    console.error('Innertube search fallback error in Netlify function:', err);
  }

  return new Response(JSON.stringify({ success: true, results: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
