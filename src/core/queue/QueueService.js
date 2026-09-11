/**
 * QueueService
 * First-class headless queue service for Liquid Music.
 * Decouples queue state, duplicate handling, shuffle, and repeat logic from React components.
 * Persists and restores playback queues across view transitions and reloads.
 */

import { storageService } from '../../services/storageService';

const QUEUE_STORAGE_KEY = 'liquid_music_active_queue_v2';

class QueueService {
  constructor() {
    this.tracks = [];
    this.currentIndex = 0;
    this.isShuffle = false;
    this.repeatMode = 'off'; // 'off' | 'all' | 'one'
    this.listeners = new Set();

    this.restoreState();
  }

  getState() {
    const currentTrack = this.tracks[this.currentIndex] || null;
    return {
      tracks: [...this.tracks],
      currentIndex: this.currentIndex,
      currentTrack,
      isShuffle: this.isShuffle,
      repeatMode: this.repeatMode,
      hasTracks: this.tracks.length > 0,
      hasNext: this.hasNext(),
      hasPrevious: this.hasPrevious()
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = this.getState();
    this.saveState();
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (err) {
        console.error('Queue listener error:', err);
      }
    }
  }

  setQueue(newTracks, startIndex = 0) {
    if (!Array.isArray(newTracks)) return;

    // Filter duplicates while preserving order
    const seen = new Set();
    const unique = [];
    for (const t of newTracks) {
      if (t && t.id && !seen.has(t.id)) {
        seen.add(t.id);
        unique.push(t);
      }
    }

    this.tracks = unique;
    this.currentIndex = Math.max(0, Math.min(startIndex, this.tracks.length - 1));
    this.notify();
  }

  addTrack(track) {
    if (!track || !track.id) return;

    const existingIdx = this.tracks.findIndex(t => t.id === track.id);
    if (existingIdx >= 0) {
      this.currentIndex = existingIdx;
    } else {
      this.tracks.push(track);
      this.currentIndex = this.tracks.length - 1;
    }
    this.notify();
  }

  removeTrack(index) {
    if (index < 0 || index >= this.tracks.length) return;

    this.tracks.splice(index, 1);
    if (index < this.currentIndex) {
      this.currentIndex = Math.max(0, this.currentIndex - 1);
    } else if (this.currentIndex >= this.tracks.length) {
      this.currentIndex = Math.max(0, this.tracks.length - 1);
    }
    this.notify();
  }

  clearQueue() {
    this.tracks = [];
    this.currentIndex = 0;
    this.notify();
  }

  getCurrentTrack() {
    return this.tracks[this.currentIndex] || null;
  }

  setIndex(index) {
    if (index >= 0 && index < this.tracks.length) {
      this.currentIndex = index;
      this.notify();
    }
  }

  hasNext() {
    if (this.tracks.length === 0) return false;
    if (this.repeatMode === 'all' || this.isShuffle) return true;
    return this.currentIndex < this.tracks.length - 1;
  }

  hasPrevious() {
    if (this.tracks.length === 0) return false;
    if (this.repeatMode === 'all') return true;
    return this.currentIndex > 0;
  }

  getNextTrack() {
    if (this.tracks.length === 0) return null;

    if (this.repeatMode === 'one') {
      return this.getCurrentTrack();
    }

    let nextIdx = this.currentIndex + 1;
    if (this.isShuffle) {
      if (this.tracks.length > 1) {
        let randIdx;
        do {
          randIdx = Math.floor(Math.random() * this.tracks.length);
        } while (randIdx === this.currentIndex && this.tracks.length > 1);
        nextIdx = randIdx;
      } else {
        nextIdx = 0;
      }
    } else if (nextIdx >= this.tracks.length) {
      // Loop smoothly through queue
      nextIdx = 0;
    }

    this.currentIndex = nextIdx;
    this.notify();
    return this.tracks[nextIdx] || null;
  }

  getPreviousTrack(currentTime = 0) {
    if (this.tracks.length === 0) return null;

    // If song is past first 4 seconds, restart current track
    if (currentTime > 4) {
      return this.getCurrentTrack();
    }

    let prevIdx = this.currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = Math.max(0, this.tracks.length - 1);
    }

    this.currentIndex = prevIdx;
    this.notify();
    return this.tracks[prevIdx] || null;
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    this.notify();
    return this.isShuffle;
  }

  cycleRepeatMode() {
    const modes = ['off', 'all', 'one'];
    const currentIdx = modes.indexOf(this.repeatMode);
    this.repeatMode = modes[(currentIdx + 1) % modes.length];
    this.notify();
    return this.repeatMode;
  }

  saveState() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify({
        tracks: this.tracks,
        currentIndex: this.currentIndex,
        isShuffle: this.isShuffle,
        repeatMode: this.repeatMode
      }));
    } catch {}
  }

  restoreState() {
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.tracks)) {
          this.tracks = parsed.tracks;
          this.currentIndex = typeof parsed.currentIndex === 'number' ? parsed.currentIndex : 0;
          this.isShuffle = Boolean(parsed.isShuffle);
          this.repeatMode = parsed.repeatMode || 'off';
        }
      }
    } catch {}
  }
}

export const queueService = new QueueService();
