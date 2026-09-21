const STORAGE_KEY = 'playback_history';
const MAX_HISTORY_ENTRIES = 200;
const DEDUPLICATION_INTERVAL_MS = 30 * 1000; // 30 seconds

export const historyService = {
  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load playback history:', e);
      return [];
    }
  },

  addToHistory(track) {
    if (!track) {
      return this.getHistory();
    }

    const history = this.getHistory();
    const now = Date.now();

    // Deduplicate consecutive plays of the exact same track within 30 seconds
    if (history.length > 0) {
      const lastEntry = history[history.length - 1];
      const isSameTrack = Boolean(
        lastEntry && (
          (track.id != null && lastEntry.id != null && (lastEntry.id === track.id || String(lastEntry.id) === String(track.id))) ||
          (!track.id && !lastEntry.id && track.title && track.title === lastEntry.title)
        )
      );
      const isRecent = lastEntry && Math.abs(now - (lastEntry.playedAt || 0)) < DEDUPLICATION_INTERVAL_MS;

      if (isSameTrack && isRecent) {
        return history;
      }
    }

    const newEntry = {
      ...track,
      playedAt: now
    };

    history.push(newEntry);

    // Keep at most the most recent 200 entries
    const updated = history.length > MAX_HISTORY_ENTRIES
      ? history.slice(-MAX_HISTORY_ENTRIES)
      : history;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save playback history:', e);
    }

    return updated;
  },

  getRecentlyPlayed(limit = 20) {
    if (limit <= 0) {
      return [];
    }

    const history = this.getHistory();
    const seen = new Set();
    const uniqueTracks = [];

    // Traverse from newest to oldest
    for (let i = history.length - 1; i >= 0; i--) {
      const item = history[i];
      if (!item) continue;

      const trackId = item.id != null ? String(item.id) : null;
      if (trackId) {
        if (!seen.has(trackId)) {
          seen.add(trackId);
          uniqueTracks.push(item);
          if (uniqueTracks.length >= limit) {
            break;
          }
        }
      } else {
        uniqueTracks.push(item);
        if (uniqueTracks.length >= limit) {
          break;
        }
      }
    }

    return uniqueTracks;
  },

  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    } catch (e) {
      console.error('Failed to clear playback history:', e);
      return [];
    }
  },

  getReplayStats() {
    const currentYear = new Date().getFullYear();
    const history = this.getHistory();

    let totalDurationSec = 0;
    let playCount = 0;

    for (const entry of history) {
      if (!entry) continue;

      const playedAt = entry.playedAt ? new Date(entry.playedAt) : new Date();
      const entryYear = isNaN(playedAt.getTime()) ? currentYear : playedAt.getFullYear();

      if (entryYear === currentYear) {
        playCount += 1;

        let duration = entry.duration ?? entry.track?.duration ?? entry.lengthSeconds;
        if (typeof duration === 'string') {
          duration = parseFloat(duration) || 0;
        }

        if (typeof duration === 'number' && duration > 0) {
          if (duration > 10000) {
            duration = Math.floor(duration / 1000);
          }
          totalDurationSec += duration;
        }
      }
    }

    const minutesListened = Math.round(totalDurationSec / 60);

    return {
      minutesListened,
      playCount,
      year: currentYear
    };
  }
};

export const addToHistory = (track) => historyService.addToHistory(track);
export const getRecentlyPlayed = (limit = 20) => historyService.getRecentlyPlayed(limit);
export const clearHistory = () => historyService.clearHistory();
export const getHistory = () => historyService.getHistory();
export const getReplayStats = () => historyService.getReplayStats();

import { storageService } from './storageService';

export const getLikedSongs = () => storageService.getLikedSongs();
export const isLiked = (trackId) => storageService.isLiked(trackId);
export const toggleLike = (track) => storageService.toggleLike(track);

export default historyService;
