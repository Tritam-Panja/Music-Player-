import { searchEngine } from '../../services/searchEngine';
import { ytSearchService } from '../../services/youtube/YouTubeSearchService';
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
import { historyService } from '../../services/historyService';
import { audioEngine } from '../../services/audioEngine';
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

    this.sessionHistory = new Set();
    this.htmlAudio = null;
    this.progressTimer = null;
    this.listeners = new Set();

    // Sleep Timer
    this.sleepTimerTimeout = null;
    this.sleepTimerMode = null; // null | number (minutes) | 'endOfTrack'
    this.sleepTimerEndTime = null;

    // Crossfade (direct-stream / <audio> path only)
    this.crossfade = true;
    this.isCrossfading = false;
    this.crossfadeTimer = null;
    this.nextAudio = null;
    this.pendingCrossfadeNextTrack = null;

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
      activeEngine: this.activeEngine,
      autoplay: queueService.isAutoplayEnabled(),
      crossfade: this.crossfade,
      sleepTimer: {
        mode: this.sleepTimerMode,
        endTime: this.sleepTimerEndTime,
        isActive: Boolean(this.sleepTimerMode)
      }
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
    this.consecutiveErrors = 0;
    this.attachAudioListeners(this.htmlAudio);
  }

  attachAudioListeners(audio) {
    audio.preload = 'auto';

    audio.addEventListener('playing', () => {
      if (this.htmlAudio !== audio) return;
      this.isPlaying = true;
      this.isLoading = false;
      this.consecutiveErrors = 0;
      this.error = null;
      if (this.currentTrack) {
        historyService.addToHistory(this.currentTrack);
        if (this.currentTrack.id) this.sessionHistory.add(String(this.currentTrack.id));
      }
      this.startTimer();
      this.updateMediaSessionState('playing');
      this.notify();
    });

    audio.addEventListener('pause', () => {
      if (this.htmlAudio !== audio || this.isCrossfading) return;
      this.isPlaying = false;
      this.stopTimer();
      this.updateMediaSessionState('paused');
      this.notify();
    });

    audio.addEventListener('ended', () => {
      if (this.htmlAudio !== audio) return;
      if (this.isCrossfading) {
        if (this.pendingCrossfadeNextTrack && this.nextAudio) {
          this.completeCrossfade(this.pendingCrossfadeNextTrack, this.nextAudio, audio);
        }
        return;
      }
      this.onEnded();
    });

    audio.addEventListener('timeupdate', () => {
      if (this.htmlAudio !== audio) return;
      if (this.activeEngine === 'audio') {
        this.currentTime = audio.currentTime || 0;
        this.checkCrossfade();
      }
    });

    audio.addEventListener('error', (e) => {
      if (this.htmlAudio !== audio) return;
      // Guard: only handle errors if actively using the HTML5 audio engine with a valid src
      if (this.activeEngine !== 'audio' || !audio.src || audio.src === window.location.href) {
        return;
      }
      console.warn('HTML5 Audio stream error:', e);
      if (this.currentTrack) {
        ytResolver.invalidate(this.currentTrack.id);
      }
      this.handlePlaybackFailure('Stream decode failed');
    });

    audio.addEventListener('loadedmetadata', () => {
      if (this.htmlAudio !== audio) return;
      if (audio.duration && !isNaN(audio.duration)) {
        this.duration = audio.duration;
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
        this.consecutiveErrors = 0;
        this.error = null;
        if (this.currentTrack) {
          historyService.addToHistory(this.currentTrack);
          if (this.currentTrack.id) this.sessionHistory.add(String(this.currentTrack.id));
        }
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
        this.fallbackToDirectStream();
      }
    });
  }

  handlePlaybackFailure(reason = 'Playback failed') {
    this.isLoading = false;
    this.isPlaying = false;
    this.stopTimer();

    this.consecutiveErrors = (this.consecutiveErrors || 0) + 1;
    if (this.consecutiveErrors < 3) {
      this.error = new MusicError({
        code: ErrorCodes.AUDIO_DECODE_FAILED,
        userMessage: `${reason}. Trying next track...`,
        retryable: true
      });
      this.notify();
      setTimeout(() => this.next(), 1500);
    } else {
      this.error = new MusicError({
        code: ErrorCodes.AUDIO_DECODE_FAILED,
        userMessage: 'Unable to stream these tracks right now. Please select another song.',
        retryable: false
      });
      this.notify();
    }
  }

  async fallbackToDirectStream() {
    if (!this.currentTrack || !this.currentTrack.id) return;

    try {
      const stream = await ytResolver.resolveAudioStream(this.currentTrack.id);
      if (stream && stream.streamUrl && this.htmlAudio) {
        this.activeEngine = 'audio';
        this.isLoading = true;
        this.notify();
        this.htmlAudio.src = stream.streamUrl;
        this.htmlAudio.volume = this.isMuted ? 0 : this.volume;
        await this.htmlAudio.play();
        return;
      }
    } catch (err) {
      console.warn('Fallback stream resolution failed:', err);
    }

    // Direct stream resolution could not find a playable stream
    this.handlePlaybackFailure('Track unavailable');
  }

  /**
   * Main Play Track Method
   */
  async play(track) {
    if (!track || !track.id) return;
    this.cancelCrossfade();

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
    if (track?.id) {
      this.sessionHistory.add(String(track.id));
    }

    // Stop and cleanly reset html audio without firing error events
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.removeAttribute('src');
      this.htmlAudio.load();
    }

    this.updateMediaSessionMetadata(track);
    this.notify();

    // Start YouTube IFrame playback
    ytPlayerService.setVolume((this.isMuted ? 0 : this.volume) * 100);
    ytPlayerService.loadVideo(track.id);

    // Fail-safe watchdog: if iframe does not start playing after 10 seconds, attempt fallback
    setTimeout(() => {
      if (this.currentTrack?.id === track.id && this.isLoading && this.activeEngine === 'iframe') {
        console.warn('Watchdog triggered: iframe buffer timeout. Checking fallback...');
        this.fallbackToDirectStream();
      }
    }, 10000);
  }

  pause() {
    this.cancelCrossfade();
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
    this.cancelCrossfade();
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
    this.cancelCrossfade();
    let nextTrack = queueService.getNextTrack();

    // If the queue has no next track (empty or exhausted)
    if (!nextTrack) {
      const isAutoplay = queueService.isAutoplayEnabled();
      if (!isAutoplay) {
        // Autoplay toggle is off: stop playback cleanly
        this.stop();
        return;
      }

      // Autoplay / Radio mode:
      // When the queue becomes empty after a track finishes, instead of stopping,
      // call the existing YouTube search/related-videos function using the last-played track's title/artist as the query,
      // take the top few results excluding tracks already in playback_history for this session,
      // and push them into the queue automatically.
      const lastTrack = this.currentTrack;
      if (!lastTrack) {
        this.stop();
        return;
      }

      this.isLoading = true;
      this.notify();

      try {
        const artist = lastTrack.artist && lastTrack.artist !== 'Unknown Artist' ? lastTrack.artist : '';
        const title = lastTrack.title || '';
        const query = artist ? `${artist} ${title}` : (title || lastTrack.ytQuery || 'Top Global Hits 2026');

        const results = await ytSearchService.search(query, 'video');

        // Gather all tracks in playback_history for this session and current track
        const historyList = historyService.getHistory();
        const historyIds = new Set(historyList.map(t => String(t.id)));
        if (this.sessionHistory) {
          for (const id of this.sessionHistory) {
            historyIds.add(String(id));
          }
        }
        if (lastTrack.id) {
          historyIds.add(String(lastTrack.id));
        }

        let candidates = Array.isArray(results)
          ? results.filter(t => t && t.id && !historyIds.has(String(t.id)))
          : [];

        // If all candidates were already in history, fall back to results excluding just the current track
        if (candidates.length === 0 && Array.isArray(results)) {
          candidates = results.filter(t => t && t.id && String(t.id) !== String(lastTrack.id));
        }

        // Take the top few results (e.g. 5 tracks)
        const topFew = candidates.slice(0, 5);

        if (topFew.length > 0) {
          // Push them into the queue automatically
          queueService.pushTracks(topFew);
          const autoNext = queueService.getNextTrack();
          if (autoNext) {
            this.play(autoNext);
            return;
          }
        }
      } catch (err) {
        console.warn('Autoplay radio resolution error:', err);
      }

      // If autoplay search failed completely, stop
      this.stop();
      return;
    }

    if (nextTrack) {
      this.play(nextTrack);
    } else if (this.currentTrack) {
      this.seek(0);
      this.resume();
    }
  }

  previous() {
    this.cancelCrossfade();
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

  setSleepTimer(duration) {
    this.cancelSleepTimer();

    if (duration === 'endOfTrack') {
      this.sleepTimerMode = 'endOfTrack';
      this.sleepTimerEndTime = null;
      this.notify();
      return;
    }

    const minutes = typeof duration === 'string' ? parseFloat(duration) : duration;
    if (typeof minutes === 'number' && !isNaN(minutes) && minutes > 0) {
      this.sleepTimerMode = minutes;
      this.sleepTimerEndTime = Date.now() + minutes * 60 * 1000;
      this.sleepTimerTimeout = setTimeout(() => {
        this.pause();
        this.cancelSleepTimer();
      }, minutes * 60 * 1000);
      this.notify();
    }
  }

  cancelSleepTimer() {
    if (this.sleepTimerTimeout) {
      clearTimeout(this.sleepTimerTimeout);
      this.sleepTimerTimeout = null;
    }
    this.sleepTimerMode = null;
    this.sleepTimerEndTime = null;
    this.notify();
  }

  getSleepTimer() {
    return {
      mode: this.sleepTimerMode,
      endTime: this.sleepTimerEndTime,
      isActive: Boolean(this.sleepTimerMode)
    };
  }

  onEnded() {
    this.stopTimer();
    if (this.sleepTimerMode === 'endOfTrack') {
      this.cancelSleepTimer();
      this.pause();
      return;
    }
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
        this.checkCrossfade();
      } else if (this.activeEngine === 'iframe') {
        this.currentTime = ytPlayerService.getCurrentTime() || 0;
        const dur = ytPlayerService.getDuration();
        if (dur && dur > 0) this.duration = dur;
        this.notify();
      }
    }, 250);
  }

  // Crossfade Methods (Direct-Stream / <audio> Only)
  checkCrossfade() {
    if (!this.crossfade) return;
    if (this.activeEngine !== 'audio') return;
    if (!this.isPlaying || !this.htmlAudio || this.htmlAudio.paused) return;
    if (this.isCrossfading) return;
    if (!this.duration || this.duration <= 3) return;
    if (this.sleepTimerMode === 'endOfTrack') return;

    const remaining = this.duration - this.currentTime;

    // Background prefetch direct audio stream for next track when approaching end
    if (remaining <= 10 && remaining > 1.5) {
      audioEngine.checkPreload(this.getState());
    }

    if (remaining <= 1.5 && remaining > 0) {
      this.startCrossfade();
    }
  }

  async startCrossfade() {
    if (this.isCrossfading) return;

    const nextTrack = queueService.getNextTrack();
    if (!nextTrack) return;

    this.isCrossfading = true;
    this.pendingCrossfadeNextTrack = nextTrack;
    const currentAudio = this.htmlAudio;
    const baseVolume = this.isMuted ? 0 : this.volume;
    const crossfadeMs = 1500; // 1.5s
    const startTime = Date.now();

    // Create next audio element starting at volume 0
    const nextAudio = new Audio();
    nextAudio.preload = 'auto';
    nextAudio.volume = 0;
    this.nextAudio = nextAudio;

    if (this.crossfadeTimer) {
      clearInterval(this.crossfadeTimer);
    }

    this.crossfadeTimer = setInterval(() => {
      if (!this.isCrossfading || this.htmlAudio !== currentAudio) {
        clearInterval(this.crossfadeTimer);
        this.crossfadeTimer = null;
        return;
      }

      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / crossfadeMs);

      // Simultaneously ramp current track down to 0
      currentAudio.volume = Math.max(0, baseVolume * (1 - progress));

      // Ramp next track up from 0 to baseVolume
      if (this.nextAudio && !this.nextAudio.paused) {
        this.nextAudio.volume = Math.min(baseVolume, baseVolume * progress);
      }

      if (progress >= 1) {
        clearInterval(this.crossfadeTimer);
        this.crossfadeTimer = null;
        this.completeCrossfade(nextTrack, nextAudio, currentAudio);
      }
    }, 50);

    try {
      const stream = await ytResolver.resolveAudioStream(nextTrack.id);
      if (!this.isCrossfading || this.nextAudio !== nextAudio) {
        return;
      }

      nextAudio.src = stream.streamUrl;
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / crossfadeMs);
      nextAudio.volume = Math.min(baseVolume, baseVolume * progress);
      await nextAudio.play();
    } catch (err) {
      console.warn('Crossfade failed to load direct stream for next track:', err);
      this.cancelCrossfade();
    }
  }

  completeCrossfade(nextTrack, nextAudio, currentAudio) {
    if (this.crossfadeTimer) {
      clearInterval(this.crossfadeTimer);
      this.crossfadeTimer = null;
    }

    this.isCrossfading = false;
    this.pendingCrossfadeNextTrack = null;

    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.removeAttribute('src');
        currentAudio.load();
      } catch {}
    }

    const baseVolume = this.isMuted ? 0 : this.volume;
    this.htmlAudio = nextAudio;
    this.nextAudio = null;
    this.attachAudioListeners(this.htmlAudio);
    this.htmlAudio.volume = baseVolume;

    this.currentTrack = nextTrack;
    this.currentTime = this.htmlAudio.currentTime || 0;
    this.duration = this.htmlAudio.duration || nextTrack.duration || 210;
    this.isPlaying = true;
    this.isLoading = false;
    this.activeEngine = 'audio';

    // Synchronize queue
    const trackIndex = queueService.tracks.findIndex(t => t.id === nextTrack.id);
    if (trackIndex >= 0) {
      queueService.setIndex(trackIndex);
    } else {
      queueService.addTrack(nextTrack);
    }

    historyService.addToHistory(nextTrack);
    storageService.addToHistory(nextTrack);
    if (nextTrack.id) this.sessionHistory.add(String(nextTrack.id));

    this.updateMediaSessionMetadata(nextTrack);
    this.updateMediaSessionState('playing');
    this.notify();
  }

  cancelCrossfade() {
    if (!this.isCrossfading) return;
    this.isCrossfading = false;
    this.pendingCrossfadeNextTrack = null;

    if (this.crossfadeTimer) {
      clearInterval(this.crossfadeTimer);
      this.crossfadeTimer = null;
    }

    if (this.nextAudio) {
      try {
        this.nextAudio.pause();
        this.nextAudio.removeAttribute('src');
        this.nextAudio.load();
      } catch {}
      this.nextAudio = null;
    }

    if (this.htmlAudio) {
      this.htmlAudio.volume = this.isMuted ? 0 : this.volume;
    }
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
      if (typeof settings.autoplay === 'boolean') {
        queueService.setAutoplay(settings.autoplay);
      }
      if (typeof settings.crossfade === 'boolean') {
        this.crossfade = settings.crossfade;
      }
    }
  }

  isAutoplayEnabled() {
    return queueService.isAutoplayEnabled();
  }

  setAutoplay(enabled) {
    const val = queueService.setAutoplay(enabled);
    this.notify();
    return val;
  }

  toggleAutoplay() {
    const val = queueService.toggleAutoplay();
    this.notify();
    return val;
  }

  isCrossfadeEnabled() {
    return this.crossfade;
  }

  setCrossfade(enabled) {
    this.crossfade = Boolean(enabled);
    storageService.saveSettings({ crossfade: this.crossfade });
    this.notify();
    return this.crossfade;
  }

  toggleCrossfade() {
    return this.setCrossfade(!this.crossfade);
  }
}

export const playerService = new PlayerService();
