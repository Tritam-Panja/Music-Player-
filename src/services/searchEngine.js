import { cleanTrackTitle } from '../utils/formatters';
import { apiUrl } from './apiConfig';

export const searchEngine = {
  /**
   * Search YouTube for songs or playlists
   */
  async search(query, type = 'video') {
    if (!query || query.trim().length === 0) return [];
    const searchType = typeof type === 'string' ? type : (type?.type || 'video');

    // 1. Electron Native IPC (fastest, zero CORS)
    if (typeof window !== 'undefined' && window.electronAPI?.search) {
      try {
        const res = await window.electronAPI.search(query, searchType);
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

    // 2. Web / Vite dev middleware or remote backend (/api/search)
    try {
      const res = await fetch(apiUrl(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}`));
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

    // 2. Vite / Web API or remote backend
    try {
      const res = await fetch(apiUrl(`/api/suggestions?q=${encodeURIComponent(query)}`));
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
  async getTrending() {
    return this.getTrendingCharts();
  },

  async getTrendingCharts() {
    // 1. Electron IPC
    if (typeof window !== 'undefined' && window.electronAPI?.getTrending) {
      try {
        const res = await window.electronAPI.getTrending();
        if (res?.success && Array.isArray(res.results)) return res.results;
      } catch {}
    }

    // 2. Web API or remote backend
    try {
      const res = await fetch(apiUrl('/api/trending'));
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.results)) return data.results;
      }
    } catch {}

    // 3. Fallback: empty array if trending cannot be reached
    return [];
  }
};
