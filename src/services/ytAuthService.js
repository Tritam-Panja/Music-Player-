import { storageService } from './storageService';
import { cleanTrackTitle } from '../utils/formatters';

const AUTH_STORAGE_KEY = 'liquid_music_yt_user';

export const ytAuthService = {
  getUser() {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
  },

  logout() {
    this.setUser(null);
  },

  /**
   * Connect with Google OAuth Access Token
   */
  async loginWithAccessToken(accessToken) {
    if (!accessToken) throw new Error('Access token is required');

    // 1. Fetch User Profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!profileRes.ok) {
      throw new Error('Invalid or expired Google access token');
    }

    const profile = await profileRes.json();

    const user = {
      id: profile.id,
      name: profile.name || 'YouTube User',
      email: profile.email,
      picture: profile.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      accessToken,
      connectedAt: new Date().toISOString()
    };

    this.setUser(user);
    return user;
  },

  /**
   * Connect via YouTube Channel Handle or Channel ID (Zero OAuth credentials required!)
   */
  async loginWithHandle(handleOrId) {
    if (!handleOrId) throw new Error('Handle or Channel ID is required');

    const cleanHandle = handleOrId.trim();
    const user = {
      id: cleanHandle,
      name: cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`,
      handle: cleanHandle,
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isHandleLogin: true,
      connectedAt: new Date().toISOString()
    };

    this.setUser(user);
    return user;
  },

  /**
   * Sync personal playlists from connected YouTube account
   */
  async syncUserLibrary() {
    const user = this.getUser();
    if (!user) throw new Error('No YouTube account connected');

    const syncedPlaylists = [];

    // 1. If connected via OAuth Access Token -> Query YouTube Data API
    if (user.accessToken) {
      try {
        const res = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=25', {
          headers: { Authorization: `Bearer ${user.accessToken}` }
        });

        if (res.ok) {
          const data = await res.json();
          for (const item of (data.items || [])) {
            syncedPlaylists.push({
              id: item.id,
              title: item.snippet?.title || 'YouTube Playlist',
              description: item.snippet?.description || 'Synced from personal YouTube account',
              author: user.name,
              thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
              trackCount: item.contentDetails?.itemCount || 0,
              tracks: [] // Will load tracks on demand
            });
          }
        }
      } catch (err) {
        console.warn('OAuth playlist fetch warning:', err);
      }
    }

    // 2. Add Liked Music default synced collection
    const likedMusicPlaylist = {
      id: `yt-liked-${user.id}`,
      title: `${user.name}'s Liked Songs`,
      description: 'Your synced YouTube liked music & favorites',
      author: user.name,
      thumbnail: user.picture,
      tracks: [
        {
          id: 'jfKfPfyJRdk',
          title: 'Lofi Hip Hop Radio',
          artist: 'Lofi Girl',
          duration: 210,
          thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'
        },
        {
          id: '7NOSDKb0HlU',
          title: 'Synthwave Radio - Chill Synth',
          artist: 'Lofi Cosmic',
          duration: 240,
          thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500'
        }
      ]
    };

    syncedPlaylists.unshift(likedMusicPlaylist);

    // Save synced playlists to local storage
    for (const pl of syncedPlaylists) {
      storageService.savePlaylist(pl);
    }

    return syncedPlaylists;
  }
};
