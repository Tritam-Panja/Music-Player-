const STORAGE_KEYS = {
  PLAYLISTS: 'liquid_music_playlists',
  FAVORITES: 'liquid_music_favorites',
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

  getFavorites() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleFavorite(track) {
    const favorites = this.getFavorites();
    const index = favorites.findIndex(t => t.id === track.id);
    let updated;
    if (index >= 0) {
      updated = favorites.filter(t => t.id !== track.id);
    } else {
      updated = [track, ...favorites];
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    return updated;
  },

  isFavorite(trackId) {
    const favorites = this.getFavorites();
    return favorites.some(t => t.id === trackId);
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
      return data ? JSON.parse(data) : { volume: 0.8, isMuted: false, repeatMode: 'off', isShuffle: false };
    } catch {
      return { volume: 0.8, isMuted: false, repeatMode: 'off', isShuffle: false };
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
};
