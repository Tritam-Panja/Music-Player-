export default async (req) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q');

  if (!q) {
    return new Response(JSON.stringify({ suggestions: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const res = await fetch(`https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&hl=en&gl=us&ds=yt&q=${encodeURIComponent(q)}`);
    const text = await res.text();
    const match = text.match(/^[^(]*\((.*)\);?$/);
    if (match && match[1]) {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed[1])) {
        const suggestions = parsed[1].map(item => item[0]).filter(Boolean);
        return new Response(JSON.stringify({ suggestions }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  } catch (err) {
    console.error('Suggestions error in Netlify function:', err);
  }

  return new Response(JSON.stringify({ suggestions: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
