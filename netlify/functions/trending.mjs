import { YouTube } from 'youtube-sr';

export default async () => {
  try {
    const results = await YouTube.search('top songs global trending music', {
      limit: 20,
      type: 'video'
    });

    if (Array.isArray(results) && results.length > 0) {
      const formatted = results.map(item => ({
        id: item.id,
        type: 'video',
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
    console.error('Trending fetch error in Netlify function:', err);
  }

  return new Response(JSON.stringify({ success: true, results: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
