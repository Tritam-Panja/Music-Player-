import { searchEngine } from '../../services/searchEngine';
/**
 * PlayerService
 * Persistent, headless audio engine for Liquid Music.
 * Survives all React view/route transitions without interruption.
 * Coordinates YouTubePlayerService (Iframe) and HTML5 Audio (Direct Stream Fallback),
 * MediaSession API sync, automated error recovery, and seamless Queue integration.
 */

import { queueService } from '../queue/QueueService';
import { ytPlayerService } from '../../services/youtube/YouTubePlayerService';
import { ytResolver } from '../../services/youtube/YouTubeResolver';
import { storageService } from '../../services/storageService';
import { MusicError, ErrorCodes } from '../errors/MusicError';

class PlayerService {
  constructor() {
    this.currentTrack = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 0.8;
    this.isMuted = false;
    this.isLoading = false;
    this.error = null;
    this.activeEngine = 'iframe'; // 'iframe' | 'audio'

    this.htmlAudio = null;
    this.progressTimer = null;
    this.listeners = new Set();

    this.initHtmlAudio();
    this.initYouTubePlayerListener();
    this.initMediaSession();
    this.restoreSettings();

    this.onEnded = this.onEnded.bind(this);
  }

  getState() {
    return {
      currentTrack: this.currentTrack,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      isMuted: this.isMuted,
      isLoading: this.isLoading,
      error: this.error,
      activeEngine: this.activeEngine
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (err) {
        console.error('Player listener error:', err);
      }
    }
  }

  initHtmlAudio() {
    if (typeof window === 'undefined') return;

    this.htmlAudio = new Audio();
    this.htmlAudio.preload = 'auto';

    this.htmlAudio.addEventListener('playing', () => {
      this.isPlaying = true;
      this.isLoading = false;
      this.startTimer();
      this.updateMediaSessionState('playing');
      this.notify();
    });

    this.htmlAudio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.stopTimer();
      this.updateMediaSessionState('paused');
      this.notify();
    });

    this.htmlAudio.addEventListener('ended', () => {
      this.onEnded();
    });

    this.htmlAudio.addEventListener('error', (e) => {
      console.warn('HTML5 Audio stream error:', e);
      if (this.currentTrack) {
        ytResolver.invalidate(this.currentTrack.id);
      }
      this.error = new MusicError({
        code: ErrorCodes.AUDIO_DECODE_FAILED,
        userMessage: 'Stream decode failed. Auto-advancing to next track...',
        retryable: true
      });
      this.notify();
      setTimeout(() => this.next(), 1200);
    });

    this.htmlAudio.addEventListener('loadedmetadata', () => {
      if (this.htmlAudio.duration && !isNaN(this.htmlAudio.duration)) {
        this.duration = this.htmlAudio.duration;
        this.notify();
      }
    });
  }

  initYouTubePlayerListener() {
    ytPlayerService.subscribe((event, data) => {
      if (this.activeEngine !== 'iframe') return;

      if (event === 'playing') {
        this.isPlaying = true;
        this.isLoading = false;
        if (data?.duration && data.duration > 0) {
          this.duration = data.duration;
        }
        this.startTimer();
        this.updateMediaSessionState('playing');
        this.notify();
      } else if (event === 'paused') {
        this.isPlaying = false;
        this.stopTimer();
        this.updateMediaSessionState('paused');
        this.notify();
      } else if (event === 'ended') {
        this.onEnded();
      } else if (event === 'buffering') {
        this.isLoading = true;
        this.notify();
      } else if (event === 'error') {
        console.warn('YouTubePlayer error event:', data);
        if (data?.isEmbedRestricted) {
          this.fallbackToDirectStream();
        } else {
          this.fallbackToDirectStream();
        }
      }
    });
  }

  async fallbackToDirectStream() {
    if (!this.currentTrack || !this.currentTrack.id) return;
    this.activeEngine = 'audio';
    this.isLoading = true;
    this.notify();

    try {
      const stream = await ytResolver.resolveAudioStream(this.currentTrack.id);
      if (stream && stream.streamUrl && this.htmlAudio) {
        this.htmlAudio.src = stream.streamUrl;
        this.htmlAudio.volume = this.isMuted ? 0 : this.volume;
        await this.htmlAudio.play();
        return;
      }
    } catch (err) {
      console.warn('Fallback stream failed:', err);
    }

    // Auto-advance if stream cannot be played
    this.onEnded();
  }

  /**
   * Main Play Track Method
   */
  async play(track) {
    if (!track || !track.id) return;

    this.currentTrack = track;
    this.currentTime = 0;
    this.duration = track.duration || 210;
    this.isPlaying = true;
    this.isLoading = true;
    this.error = null;
    this.activeEngine = 'iframe';

    // Synchronize queue
    const trackIndex = queueService.tracks.findIndex(t => t.id === track.id);
    if (trackIndex >= 0) {
      queueService.setIndex(trackIndex);
    } else {
      queueService.addTrack(track);
    }

    // Record listening history
    storageService.addToHistory(track);

    // Stop html audio if currently playing
    if (this.htmlAudio && !this.htmlAudio.paused) {
      this.htmlAudio.pause();
      this.htmlAudio.src = '';
    }

    this.updateMediaSessionMetadata(track);
    this.notify();

    // Start YouTube IFrame playback
    ytPlayerService.setVolume((this.isMuted ? 0 : this.volume) * 100);
    ytPlayerService.loadVideo(track.id);

    // Fail-safe watchdog: if iframe does not start playing after 6 seconds, fallback
    setTimeout(() => {
      if (this.currentTrack?.id === track.id && this.isLoading && this.activeEngine === 'iframe') {
        console.warn('Watchdog triggered: iframe slow to buffer. Switching to direct audio stream...');
        this.fallbackToDirectStream();
      }
    }, 6000);
  }

  pause() {
    if (this.activeEngine === 'audio' && this.htmlAudio) {
      this.htmlAudio.pause();
    } else {
      ytPlayerService.pause();
    }
    this.isPlaying = false;
    this.stopTimer();
    this.updateMediaSessionState('paused');
    this.notify();
  }

  resume() {
    if (this.activeEngine === 'audio' && this.htmlAudio && this.htmlAudio.src) {
      this.htmlAudio.play().catch(() => {});
    } else {
      ytPlayerService.play();
    }
    this.isPlaying = true;
    this.startTimer();
    this.updateMediaSessionState('playing');
    this.notify();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  seek(seconds) {
    const clamped = Math.max(0, Math.min(seconds, this.duration || 9999));
    this.currentTime = clamped;

    if (this.activeEngine === 'audio' && this.htmlAudio) {
      this.htmlAudio.currentTime = clamped;
    } else {
      ytPlayerService.seekTo(clamped);
    }

    this.notify();
  }

  setVolume(vol) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;

    if (this.htmlAudio) {
      this.htmlAudio.volume = this.isMuted ? 0 : clamped;
    }
    ytPlayerService.setVolume((this.isMuted ? 0 : clamped) * 100);

    storageService.saveSettings({ volume: clamped, isMuted: this.isMuted });
    this.notify();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.htmlAudio) {
      this.htmlAudio.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.isMuted) {
      ytPlayerService.mute();
    } else {
      ytPlayerService.unMute();
      ytPlayerService.setVolume(this.volume * 100);
    }
    storageService.saveSettings({ volume: this.volume, isMuted: this.isMuted });
    this.notify();
  }

  async next() {
    let nextTrack = queueService.getNextTrack();
    if (!nextTrack || queueService.tracks.length <= 1) {
      try {
        
        const trending = await searchEngine.getTrendingCharts();
        if (Array.isArray(trending) && trending.length > 0) {
          const fresh = trending.filter(t => t.id !== this.currentTrack?.id);
          if (fresh.length > 0) {
            const combined = [this.currentTrack, ...fresh].filter(Boolean);
            queueService.setQueue(combined, 1);
            nextTrack = fresh[0];
          }
        }
      } catch (err) {
        console.warn('Auto-next fallback error:', err);
      }
    }

    if (nextTrack) {
      this.play(nextTrack);
    } else if (this.currentTrack) {
      this.seek(0);
      this.resume();
    }
  }

  previous() {
    const prevTrack = queueService.getPreviousTrack(this.currentTime);
    if (prevTrack) {
      this.play(prevTrack);
    } else {
      this.seek(0);
    }
  }

  stop() {
    this.pause();
    this.currentTime = 0;
    this.isPlaying = false;
    this.notify();
  }

  onEnded() {
    this.stopTimer();
    this.next();
  }

  startTimer() {
    this.stopTimer();
    this.progressTimer = setInterval(() => {
      if (this.activeEngine === 'audio' && this.htmlAudio) {
        this.currentTime = this.htmlAudio.currentTime || 0;
        if (this.htmlAudio.duration && !isNaN(this.htmlAudio.duration)) {
          this.duration = this.htmlAudio.duration;
        }
        this.notify();
      } else if (this.activeEngine === 'iframe') {
        this.currentTime = ytPlayerService.getCurrentTime() || 0;
        const dur = ytPlayerService.getDuration();
        if (dur && dur > 0) this.duration = dur;
        this.notify();
      }
    }, 250);
  }

  stopTimer() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  // Queue helper proxies
  setQueue(tracks, startIndex = 0) {
    queueService.setQueue(tracks, startIndex);
  }

  addToQueue(track) {
    queueService.addTrack(track);
  }

  removeFromQueue(index) {
    queueService.removeTrack(index);
  }

  clearQueue() {
    queueService.clearQueue();
  }

  getCurrentTrack() {
    return this.currentTrack;
  }

  initMediaSession() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.resume());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) this.seek(details.seekTime);
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        this.seek(this.currentTime - (details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        this.seek(this.currentTime + (details.seekOffset || 10));
      });
    }
  }

  updateMediaSessionMetadata(track) {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && track) {
      try {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album || 'Liquid Music',
          artwork: [
            { src: track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500', sizes: '512x512', type: 'image/jpeg' }
          ]
        });
      } catch {}
    }
  }

  updateMediaSessionState(state) {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = state;
      } catch {}
    }
  }

  restoreSettings() {
    const settings = storageService.getSettings();
    if (settings) {
      if (typeof settings.volume === 'number') this.volume = settings.volume;
      if (typeof settings.isMuted === 'boolean') this.isMuted = settings.isMuted;
    }
  }
}

export const playerService = new PlayerService();
