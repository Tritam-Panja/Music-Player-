const STORAGE_KEYS = {
  PLAYLISTS: 'liquid_music_playlists',
  FAVORITES: 'liquid_music_favorites',
  LIKED_SONGS: 'liked_songs',
  HISTORY: 'liquid_music_history',
  SETTINGS: 'liquid_music_settings',
  QUEUE: 'liquid_music_queue',
};

const DEFAULT_PLAYLISTS = [];

export const storageService = {
  getPlaylists() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (!data) {
        return [];
      }
      let parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      const DEMO_IDS = ['jfKfPfyJRdk', '5yx6BWlEVcY', '7NOSDKb0HlU'];
      // Filter out legacy default playlist or playlists composed solely of demo songs
      parsed = parsed.filter(p => {
        if (p.id === 'chill-lofi-beats') return false;
        if (Array.isArray(p.tracks)) {
          p.tracks = p.tracks.filter(t => !DEMO_IDS.includes(t.id));
        }
        return true;
      });

      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(parsed));
      return parsed;
    } catch (e) {
      console.error('Failed to load playlists:', e);
      return [];
    }
  },

  savePlaylist(playlist) {
    const playlists = this.getPlaylists();
    const existingIndex = playlists.findIndex(p => p.id === playlist.id);
    if (existingIndex >= 0) {
      playlists[existingIndex] = playlist;
    } else {
      playlists.unshift(playlist);
    }
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    return playlists;
  },

  deletePlaylist(playlistId) {
    const playlists = this.getPlaylists().filter(p => p.id !== playlistId);
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    return playlists;
  },

  getLikedSongs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIKED_SONGS);
      if (!data) {
        // Fallback / migration from legacy favorites if exists
        const legacy = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        if (legacy) {
          const parsedLegacy = JSON.parse(legacy);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            localStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(parsedLegacy));
            return parsedLegacy;
          }
        }
        return [];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load liked songs:', e);
      return [];
    }
  },

  isLiked(trackId) {
    if (!trackId) return false;
    const liked = this.getLikedSongs();
    return liked.some(t => t.id === trackId || String(t.id) === String(trackId));
  },

  toggleLike(track) {
    if (!track || !track.id) return this.getLikedSongs();
    const liked = this.getLikedSongs();
    const index = liked.findIndex(t => t.id === track.id || String(t.id) === String(track.id));
    let updated;
    if (index >= 0) {
      updated = liked.filter(t => !(t.id === track.id || String(t.id) === String(track.id)));
    } else {
      updated = [track, ...liked];
    }
    try {
      localStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save liked songs:', e);
    }
    return updated;
  },

  getFavorites() {
    return this.getLikedSongs();
  },

  toggleFavorite(track) {
    return this.toggleLike(track);
  },

  isFavorite(trackId) {
    return this.isLiked(trackId);
  },

  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToHistory(track) {
    const history = this.getHistory().filter(t => t.id !== track.id);
    const updated = [track, ...history].slice(0, 50); // limit to 50 recent songs
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  },

  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const parsed = data ? JSON.parse(data) : {};
      return {
        volume: 0.8,
        isMuted: false,
        repeatMode: 'off',
        isShuffle: false,
        autoplay: true,
        crossfade: true,
        ...parsed
      };
    } catch {
      return { volume: 0.8, isMuted: false, repeatMode: 'off', isShuffle: false, autoplay: true, crossfade: true };
    }
  },

  saveSettings(settings) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }
};

export const getLikedSongs = () => storageService.getLikedSongs();
export const isLiked = (trackId) => storageService.isLiked(trackId);
export const toggleLike = (track) => storageService.toggleLike(track);
export const getFavorites = () => storageService.getFavorites();
export const toggleFavorite = (track) => storageService.toggleFavorite(track);
export const isFavorite = (trackId) => storageService.isFavorite(trackId);

export default storageService;

