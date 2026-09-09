const STORAGE_KEYS = {
  PLAYLISTS: 'liquid_music_playlists',
  FAVORITES: 'liquid_music_favorites',
  HISTORY: 'liquid_music_history',
  SETTINGS: 'liquid_music_settings',
  QUEUE: 'liquid_music_queue',
};

// Initial default sample playlist featuring copyright-free chill/lofi music
const DEFAULT_PLAYLISTS = [
  {
    id: 'chill-lofi-beats',
    title: 'Neon Chillwave & Lofi',
    description: 'Smooth atmospheric beats to code and relax to',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60',
    tracks: [
      {
        id: 'jfKfPfyJRdk',
        title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
        artist: 'Lofi Girl',
        duration: 210,
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60',
      },
      {
        id: '5yx6BWlEVcY',
        title: 'Chillhop Essentials - Summer Vibes',
        artist: 'Chillhop Music',
        duration: 185,
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
      },
      {
        id: '7NOSDKb0HlU',
        title: 'Synthwave Radio - Chill Synth / Retrowave',
        artist: 'Lofi Cosmic',
        duration: 240,
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60',
      }
    ]
  }
];

export const storageService = {
  getPlaylists() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(DEFAULT_PLAYLISTS));
        return DEFAULT_PLAYLISTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load playlists:', e);
      return DEFAULT_PLAYLISTS;
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
