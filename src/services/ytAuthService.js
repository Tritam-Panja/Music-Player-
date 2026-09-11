import { storageService } from './storageService';
import { ytConnectionService, ConnectionStatus } from './youtube/YouTubeConnectionService';
import { cleanTrackTitle } from '../utils/formatters';

export const ytAuthService = {
  getUser() {
    return ytConnectionService.getState().user;
  },

  getStatus() {
    return ytConnectionService.getState().status;
  },

  getConnectionState() {
    return ytConnectionService.getState();
  },

  subscribe(listener) {
    return ytConnectionService.subscribe(listener);
  },

  restoreSession() {
    return ytConnectionService.restoreSession();
  },

  logout() {
    ytConnectionService.disconnect();
  },

  /**
   * Real Electron Desktop in-app sign-in
   */
  async loginWithElectron() {
    return await ytConnectionService.connectWithElectron();
  },

  /**
   * Connect with Google OAuth Access Token
   */
  async loginWithAccessToken(accessToken) {
    return await ytConnectionService.connectWithToken(accessToken);
  },

  /**
   * Connect via public channel handle (read-only identity)
   */
  async loginWithHandle(handleOrId) {
    return await ytConnectionService.connectWithChannelHandle(handleOrId);
  },

  /**
   * Import YouTube / YouTube Music playlist by URL or ID (self-contained, no backend dependency)
   */
  async importPlaylist(playlistUrlOrId) {
    if (!playlistUrlOrId) throw new Error('Playlist URL or ID is required');

    let playlistId = playlistUrlOrId.trim();
    if (playlistId.includes('list=')) {
      playlistId = playlistId.split('list=')[1].split('&')[0];
    }

    // Try fetching playlist details via Invidious public endpoints with bounded timeout
    const INVIDIOUS_ENDPOINTS = [
      'https://inv.tux.pizza',
      'https://invidious.nerdvpn.de',
      'https://yt.drgnz.club'
    ];

    for (const endpoint of INVIDIOUS_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${endpoint}/api/v1/playlists/${playlistId}`, {
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const videos = data.videos || [];
          const newPlaylist = {
            id: `yt-pl-${playlistId}`,
            title: data.title || 'Imported Playlist',
            description: data.description || `Imported ${videos.length} tracks from YouTube`,
            author: data.author || 'YouTube User',
            thumbnail: data.playlistThumbnail || (videos[0]?.videoThumbnails?.[0]?.url) || `https://i.ytimg.com/vi/${videos[0]?.videoId}/hqdefault.jpg`,
            tracks: videos.map(v => ({
              id: v.videoId,
              title: cleanTrackTitle(v.title),
              artist: v.author || 'Unknown Artist',
              duration: v.lengthSeconds || 0,
              thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`
            }))
          };

          storageService.savePlaylist(newPlaylist);
          return newPlaylist;
        }
      } catch {}
    }

    // Fallback lightweight placeholder playlist
    const fallbackPlaylist = {
      id: `yt-pl-${playlistId}`,
      title: 'Imported YouTube Playlist',
      description: `Playlist ID: ${playlistId}`,
      author: 'YouTube',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
      tracks: []
    };
    storageService.savePlaylist(fallbackPlaylist);
    return fallbackPlaylist;
  },

  /**
   * Sync personal playlists from storage / active session
   */
  async syncUserLibrary() {
    // Return existing saved playlists
    return storageService.getPlaylists();
  }
};

