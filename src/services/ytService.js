import { cleanTrackTitle } from '../utils/formatters';

// List of public reliable Invidious & Piped instances with automatic rotation
const INVIDIOUS_INSTANCES = [
  'https://inv.tux.pizza',
  'https://invidious.nerdvpn.de',
  'https://invidious.jing.rocks',
  'https://invidious.einfachzocken.eu',
  'https://yt.drgnz.club'
];

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.privacydev.net',
  'https://piped-api.lunar.icu'
];

export const ytService = {
  /**
   * Extract YouTube playlist ID from various URL formats or raw ID
   */
  extractPlaylistId(urlOrId) {
    if (!urlOrId) return null;
    const trimmed = urlOrId.trim();

    // Check if it's already a clean playlist ID (starts with PL, RD, OLAK, etc.)
    if (/^[A-Za-z0-9_-]{12,}$/.test(trimmed)) {
      return trimmed;
    }

    try {
      const url = new URL(trimmed);
      const listParam = url.searchParams.get('list');
      if (listParam) return listParam;
    } catch {
      // Not a valid URL, check with regex
      const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
      if (match) return match[1];
    }

    return null;
  },

  /**
   * Extract single video ID from YouTube URL
   */
  extractVideoId(urlOrId) {
    if (!urlOrId) return null;
    const trimmed = urlOrId.trim();

    if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    try {
      const url = new URL(trimmed);
      if (url.hostname.includes('youtu.be')) {
        return url.pathname.slice(1);
      }
      return url.searchParams.get('v');
    } catch {
      const match = trimmed.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/);
      return match && match[1].length === 11 ? match[1] : null;
    }
  },

  /**
   * Fetch playlist details and track items from Invidious API
   */
  async fetchPlaylist(playlistId) {
    if (!playlistId) throw new Error('Valid Playlist ID is required');

    let lastError = null;

    // 1. Try Invidious instances
    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`${instance}/api/v1/playlists/${playlistId}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const videos = data.videos || [];
          
          return {
            id: playlistId,
            title: data.title || 'Imported Playlist',
            description: data.description || `Imported ${videos.length} tracks from YouTube`,
            author: data.author || 'YouTube User',
            thumbnail: data.playlistThumbnail || (videos[0]?.videoThumbnails?.[0]?.url) || `https://i.ytimg.com/vi/${videos[0]?.videoId}/hqdefault.jpg`,
            trackCount: data.videoCount || videos.length,
            tracks: videos.map(v => ({
              id: v.videoId,
              title: cleanTrackTitle(v.title),
              artist: v.author || 'Unknown Artist',
              duration: v.lengthSeconds || 0,
              thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`
            }))
          };
        }
      } catch (e) {
        lastError = e;
      }
    }

    // 2. Try Piped instances as fallback
    for (const instance of PIPED_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`${instance}/playlists/${playlistId}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const items = data.relatedStreams || [];
          return {
            id: playlistId,
            title: data.name || 'Imported Playlist',
            description: `Imported ${items.length} tracks from YouTube`,
            author: data.uploader || 'YouTube User',
            thumbnail: data.thumbnailUrl || (items[0]?.thumbnail),
            trackCount: items.length,
            tracks: items.map(v => ({
              id: v.url ? v.url.replace('/watch?v=', '') : v.id,
              title: cleanTrackTitle(v.title),
              artist: v.uploaderName || 'Unknown Artist',
              duration: v.duration || 0,
              thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`
            }))
          };
        }
      } catch (e) {
        lastError = e;
      }
    }

    throw new Error(lastError ? `Unable to fetch playlist: ${lastError.message}` : 'All YouTube proxy instances were unreachable.');
  },

  /**
   * Search YouTube for songs, artists, or playlists
   */
  async search(query, filter = 'all') {
    if (!query || query.trim().length === 0) return [];

    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const typeParam = filter === 'playlists' ? 'playlist' : 'video';
        const res = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=${typeParam}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const results = await res.json();
          if (Array.isArray(results)) {
            return results.map(item => ({
              id: item.videoId || item.playlistId,
              type: item.type || (item.videoId ? 'video' : 'playlist'),
              title: cleanTrackTitle(item.title),
              artist: item.author || 'Unknown Artist',
              duration: item.lengthSeconds || 0,
              thumbnail: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
              views: item.viewCount || 0,
              uploaded: item.publishedText || ''
            }));
          }
        }
      } catch {
        // try next instance
      }
    }

    return [];
  }
};
