import { cleanTrackTitle } from '../utils/formatters';

export const searchEngine = {
  /**
   * Search YouTube for songs or playlists
   */
  async search(query, type = 'video') {
    if (!query || query.trim().length === 0) return [];

    // 1. Electron Native IPC (fastest, zero CORS)
    if (typeof window !== 'undefined' && window.electronAPI?.search) {
      try {
        const res = await window.electronAPI.search(query, type);
        if (res?.success && Array.isArray(res.results)) {
          return res.results.map(t => ({
            ...t,
            title: cleanTrackTitle(t.title)
          }));
        }
      } catch (err) {
        console.warn('Electron search fallback to web API:', err);
      }
    }

    // 2. Web / Vite dev middleware (/api/search)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.results)) {
          return data.results.map(t => ({
            ...t,
            title: cleanTrackTitle(t.title)
          }));
        }
      }
    } catch (err) {
      // fallback to Innertube direct
    }

    // 3. Fallback: Direct YouTube Music Innertube API
    try {
      const response = await fetch('https://music.youtube.com/youtubei/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB_REMIX',
              clientVersion: '1.20231204.01.00'
            }
          },
          query
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Parse section list
        const contents = data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
        const tracks = [];

        for (const section of contents) {
          const items = section?.musicShelfRenderer?.contents || [];
          for (const item of items) {
            const flexColumns = item?.musicResponsiveListItemRenderer?.flexColumns || [];
            const title = flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
            const artist = flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
            const videoId = item?.musicResponsiveListItemRenderer?.playlistItemData?.videoId;
            const thumbUrl = item?.musicResponsiveListItemRenderer?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url;

            if (videoId && title) {
              tracks.push({
                id: videoId,
                title: cleanTrackTitle(title),
                artist: artist || 'Unknown Artist',
                duration: 210,
                thumbnail: thumbUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                type: 'video'
              });
            }
          }
        }

        if (tracks.length > 0) return tracks;
      }
    } catch (err) {
      console.warn('Innertube search fallback:', err);
    }

    return [];
  },

  /**
   * Get instant search query suggestions (Spotify-like autocomplete)
   */
  async getSuggestions(query) {
    if (!query || query.trim().length === 0) return [];

    // 1. Electron IPC
    if (typeof window !== 'undefined' && window.electronAPI?.getSuggestions) {
      try {
        const suggestions = await window.electronAPI.getSuggestions(query);
        if (Array.isArray(suggestions)) return suggestions;
      } catch {}
    }

    // 2. Vite / Web API
    try {
      const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.suggestions)) return data.suggestions;
      }
    } catch {}

    // 3. Fallback: Direct Google suggest client
    try {
      const res = await fetch(`https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&hl=en&gl=us&ds=yt&q=${encodeURIComponent(query)}`);
      const text = await res.text();
      const match = text.match(/^[^(]*\((.*)\);?$/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed[1])) {
          return parsed[1].map(item => item[0]).filter(Boolean);
        }
      }
    } catch {}

    return [];
  },

  /**
   * Get Top 50 Trending Global Hits & Charts
   */
  async getTrendingCharts() {
    // 1. Electron IPC
    if (typeof window !== 'undefined' && window.electronAPI?.getTrending) {
      try {
        const res = await window.electronAPI.getTrending();
        if (res?.success && Array.isArray(res.results)) return res.results;
      } catch {}
    }

    // 2. Web API
    try {
      const res = await fetch('/api/trending');
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.results)) return data.results;
      }
    } catch {}

    // 3. Curated default high-quality charts fallback
    return [
      {
        id: 'jfKfPfyJRdk',
        title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
        artist: 'Lofi Girl',
        duration: 240,
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'
      },
      {
        id: '7NOSDKb0HlU',
        title: 'Synthwave Radio - Chill Synth / Retrowave',
        artist: 'Lofi Cosmic',
        duration: 215,
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500'
      },
      {
        id: '5yx6BWlEVcY',
        title: 'Chillhop Essentials - Summer Vibes',
        artist: 'Chillhop Music',
        duration: 185,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500'
      }
    ];
  }
};
