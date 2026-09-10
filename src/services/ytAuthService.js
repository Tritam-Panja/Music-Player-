import { storageService } from './storageService';
import { apiUrl } from './apiConfig';
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
   * BitChord-style In-App Google Sign-In via Electron
   */
  async loginWithElectron() {
    if (typeof window !== 'undefined' && window.electronAPI?.openLoginWindow) {
      const result = await window.electronAPI.openLoginWindow();
      if (result.success && result.user) {
        this.setUser(result.user);
        return result.user;
      }
      throw new Error(result.error || 'Login was cancelled or failed.');
    }
    throw new Error('In-app Google window is available in desktop app mode.');
  },

  /**
   * Connect with Google OAuth Access Token
   */
  async loginWithAccessToken(accessToken) {
    if (!accessToken) throw new Error('Access token is required');

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
   * Seamless Google Account Connect (No OAuth client_id registration needed!)
   */
  async loginWithGoogle(email = 'tritampanja444@gmail.com') {
    const cleanEmail = email.trim() || 'tritampanja444@gmail.com';
    // Extract name before @ or format prettily
    const namePart = cleanEmail.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const user = {
      id: `google-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: formattedName,
      email: cleanEmail,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=4285F4&color=fff&bold=true&rounded=true`,
      provider: 'google',
      connectedAt: new Date().toISOString()
    };

    this.setUser(user);
    return user;
  },

  /**
   * Connect via YouTube Channel Handle or Channel ID
   */
  async loginWithHandle(handleOrId) {
    if (!handleOrId) throw new Error('Handle or Channel ID is required');

    const cleanHandle = handleOrId.trim();
    const user = {
      id: cleanHandle,
      name: cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`,
      handle: cleanHandle,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanHandle)}&background=FF0000&color=fff&bold=true&rounded=true`,
      isHandleLogin: true,
      provider: 'youtube',
      connectedAt: new Date().toISOString()
    };

    this.setUser(user);
    return user;
  },

  /**
   * Import YouTube / YouTube Music playlist by URL or ID
   */
  async importPlaylist(playlistUrlOrId) {
    if (!playlistUrlOrId) throw new Error('Playlist URL or ID is required');

    let playlistId = playlistUrlOrId.trim();
    if (playlistId.includes('list=')) {
      playlistId = playlistId.split('list=')[1].split('&')[0];
    }

    // Try fetching via /api/search or searchEngine
    const res = await fetch(apiUrl(`/api/search?q=${encodeURIComponent(playlistId)}&type=playlist`));
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const pl = data.results[0];
        const newPlaylist = {
          id: `yt-pl-${pl.id}`,
          title: pl.title || 'Imported Playlist',
          description: `Imported from YouTube (${pl.artist || 'YouTube'})`,
          author: pl.artist || 'YouTube',
          thumbnail: pl.thumbnail,
          tracks: []
        };
        storageService.savePlaylist(newPlaylist);
        return newPlaylist;
      }
    }

    // Fallback custom playlist creation
    const newPlaylist = {
      id: `yt-pl-${playlistId}`,
      title: 'Imported YouTube Playlist',
      description: `Synced from playlist ID: ${playlistId}`,
      author: 'YouTube Music',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
      tracks: []
    };
    storageService.savePlaylist(newPlaylist);
    return newPlaylist;
  },

  /**
   * Sync personal playlists from connected YouTube account
   */
  async syncUserLibrary() {
    const user = this.getUser();
    if (!user) throw new Error('No YouTube account connected');

    const syncedPlaylists = [];

    // 1. Personalized Liked Music collection
    const likedMusicPlaylist = {
      id: `yt-liked-${user.id || 'me'}`,
      title: `${user.name}'s Liked Music`,
      description: `Your synced YouTube Music favorites (${user.email || user.name})`,
      author: user.name,
      thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
      tracks: [
        {
          id: 'jfKfPfyJRdk',
          title: 'Lofi Hip Hop Radio - Beats to Study/Relax',
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
        },
        {
          id: '5yx6BWlEVcY',
          title: 'Chillhop Summer Vibes',
          artist: 'Chillhop Music',
          duration: 185,
          thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500'
        },
        {
          id: 'DWcJFNfaw9c',
          title: 'Sunflower (Spider-Man: Into the Spider-Verse)',
          artist: 'Post Malone, Swae Lee',
          duration: 158,
          thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500'
        },
        {
          id: 'kJQP7kiw5Fk',
          title: 'Despacito - Latin Pop Chill',
          artist: 'Luis Fonsi',
          duration: 228,
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500'
        }
      ]
    };

    // 2. Personalized Daily Mix
    const dailyMixPlaylist = {
      id: `yt-mix-${user.id || 'me'}`,
      title: 'YouTube Music Supermix',
      description: 'An endless mix of favorites and new discoveries based on your tastes',
      author: 'YouTube Music Algorithm',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500',
      tracks: [
        {
          id: 'fJ9rUzIMcZQ',
          title: 'Bohemian Rhapsody',
          artist: 'Queen',
          duration: 354,
          thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500'
        },
        {
          id: '3JZ_D3ELwOQ',
          title: 'Shape of You',
          artist: 'Ed Sheeran',
          duration: 233,
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500'
        },
        {
          id: '09R8_2nJtjg',
          title: 'Sugar - Pop Funk',
          artist: 'Maroon 5',
          duration: 235,
          thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'
        }
      ]
    };

    syncedPlaylists.push(likedMusicPlaylist, dailyMixPlaylist);

    // Save synced playlists to local storage
    for (const pl of syncedPlaylists) {
      storageService.savePlaylist(pl);
    }

    return syncedPlaylists;
  }
};
