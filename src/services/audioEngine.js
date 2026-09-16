import { playerService } from '../core/player/PlayerService';
import { ytResolver } from './youtube/YouTubeResolver';
import { queueService } from '../core/queue/QueueService';

/**
 * AudioEngine Facade
 * Bridges legacy audioEngine imports directly to core PlayerService.
 * Handles background stream preloading for seamless gapless playback in direct-stream path.
 */
class AudioEngineFacade {
  constructor() {
    this.preloadedTrackId = null;
    this.preloadingTrackId = null;
    this.lastTrackId = null;
    this.preloadedAudio = null;

    if (typeof window !== 'undefined') {
      setTimeout(() => this.initPreloader(), 0);
    }
  }

  initPreloader() {
    // Monitor playback state and time updates to trigger preloading
    playerService.subscribe((state) => {
      if (state.currentTrack?.id !== this.lastTrackId) {
        this.lastTrackId = state.currentTrack?.id;
        this.preloadedTrackId = null;
        this.preloadedAudio = null;
      }
      this.checkPreload(state);
    });

    // Monitor queue changes so newly queued next tracks get preloaded if needed
    queueService.subscribe(() => {
      this.checkPreload();
    });
  }

  checkPreload(state) {
    const currentState = state || playerService.getState();
    // Only apply to the direct-stream <audio> path
    if (currentState.activeEngine !== 'audio') return;
    if (!currentState.isPlaying || !currentState.duration || currentState.duration <= 3) return;

    const remaining = currentState.duration - currentState.currentTime;
    // Preload a few seconds before current track ends (within 10 seconds)
    if (remaining <= 10 && remaining > 0) {
      const nextTrack = queueService.getNextTrack();
      if (nextTrack && nextTrack.id) {
        this.preloadTrack(nextTrack);
      }
    }
  }

  async preloadTrack(track) {
    if (!track || !track.id) return null;
    if (this.preloadedTrackId === track.id || this.preloadingTrackId === track.id) {
      return ytResolver.streamCache.get(track.id) || null;
    }

    this.preloadingTrackId = track.id;
    try {
      const stream = await ytResolver.resolveAudioStream(track.id);
      if (stream && stream.streamUrl) {
        this.preloadedTrackId = track.id;

        // Pre-warm the browser cache with an Audio element to eliminate buffering gaps
        if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
          const preAudio = new Audio();
          preAudio.preload = 'auto';
          preAudio.src = stream.streamUrl;
          preAudio.load();
          this.preloadedAudio = preAudio;
        }
        return stream;
      }
    } catch (err) {
      console.warn('audioEngine: stream preloading failed for track', track.id, err);
    } finally {
      this.preloadingTrackId = null;
    }
    return null;
  }

  preloadNextTrack() {
    const nextTrack = queueService.getNextTrack();
    if (nextTrack) {
      return this.preloadTrack(nextTrack);
    }
    return Promise.resolve(null);
  }

  getPreloadedTrackId() {
    return this.preloadedTrackId;
  }

  getPreloadedAudio() {
    return this.preloadedAudio;
  }
  get currentTrack() {
    return playerService.currentTrack;
  }

  get isPlaying() {
    return playerService.isPlaying;
  }

  get currentTime() {
    return playerService.currentTime;
  }

  get duration() {
    return playerService.duration;
  }

  get volume() {
    return playerService.volume;
  }

  get isMuted() {
    return playerService.isMuted;
  }

  get crossfade() {
    return playerService.crossfade;
  }

  isCrossfadeEnabled() {
    return playerService.isCrossfadeEnabled();
  }

  setCrossfade(enabled) {
    return playerService.setCrossfade(enabled);
  }

  toggleCrossfade() {
    return playerService.toggleCrossfade();
  }

  playTrack(track) {
    playerService.play(track);
  }

  pause() {
    playerService.pause();
  }

  resume() {
    playerService.resume();
  }

  togglePlay() {
    playerService.togglePlay();
  }

  seek(seconds) {
    playerService.seek(seconds);
  }

  setVolume(vol) {
    playerService.setVolume(vol);
  }

  toggleMute() {
    playerService.toggleMute();
  }

  next() {
    playerService.next();
  }

  previous() {
    playerService.previous();
  }

  subscribe(listener) {
    return playerService.subscribe(listener);
  }

  on(eventName, callback) {
    window.addEventListener(`audio:${eventName}`, callback);
  }

  off(eventName, callback) {
    window.removeEventListener(`audio:${eventName}`, callback);
  }

  emitEvent(eventName, data) {
    window.dispatchEvent(new CustomEvent(`audio:${eventName}`, { detail: data }));
  }
}

export const audioEngine = new AudioEngineFacade();

