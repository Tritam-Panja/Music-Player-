/**
 * Dual Playback Audio Engine
 * Combines YouTube Headless IFrame Engine with MediaSession API & WebAudio
 */

class AudioEngine {
  constructor() {
    this.ytPlayer = null;
    this.isReady = false;
    this.currentTrack = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 0.8;
    this.isMuted = false;
    this.listeners = new Set();
    this.progressInterval = null;

    this.initYouTubeIFrameAPI();
    this.setupMediaSession();
  }

  initYouTubeIFrameAPI() {
    if (window.YT && window.YT.Player) {
      this.createPlayer();
      return;
    }

    // Load YouTube IFrame API script tag
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      this.createPlayer();
    };
  }

  createPlayer() {
    // Hidden container for YouTube IFrame
    let container = document.getElementById('yt-audio-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'yt-audio-container';
      container.style.position = 'fixed';
      container.style.bottom = '0px';
      container.style.right = '0px';
      container.style.width = '16px';
      container.style.height = '16px';
      container.style.opacity = '0.01';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-999';
      document.body.appendChild(container);
    }

    // Determine reliable origin for web, electron, and capacitor
    const currentOrigin = typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:')
      ? window.location.origin
      : 'https://www.youtube.com';

    this.ytPlayer = new window.YT.Player('yt-audio-container', {
      height: '16',
      width: '16',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        playsinline: 1,
        enablejsapi: 1,
        origin: currentOrigin
      },
      events: {
        onReady: () => {
          this.isReady = true;
          try {
            this.ytPlayer.setVolume(this.volume * 100);
          } catch {}
          if (this.currentTrack && this.isPlaying) {
            this.loadAndPlay(this.currentTrack.id);
          }
          this.emit();
        },
        onStateChange: (event) => {
          // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering)
          if (event.data === window.YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            this.duration = this.ytPlayer.getDuration() || (this.currentTrack?.duration || 0);
            this.startProgressTimer();
            this.updateMediaSessionState('playing');
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            this.isPlaying = false;
            this.stopProgressTimer();
            this.updateMediaSessionState('paused');
          } else if (event.data === window.YT.PlayerState.ENDED) {
            this.isPlaying = false;
            this.stopProgressTimer();
            this.emitEvent('ended');
          }
          this.emit();
        },
        onError: (e) => {
          console.warn('YouTube IFrame warning code:', e.data);
          // If embedding is blocked (101 or 150) or failed, attempt direct stream fallback or auto-advance
          if (e.data === 150 || e.data === 101 || e.data === 5) {
            this.tryDirectAudioFallback();
          } else {
            this.emitEvent('error', e.data);
          }
        }
      }
    });
  }

  loadAndPlay(id) {
    if (!id || !this.ytPlayer) return;
    try {
      if (typeof this.ytPlayer.loadVideoById === 'function') {
        this.ytPlayer.loadVideoById({ videoId: id, suggestedQuality: 'small' });
        this.ytPlayer.playVideo();
      } else if (typeof this.ytPlayer.cueVideoById === 'function') {
        this.ytPlayer.cueVideoById(id);
        this.ytPlayer.playVideo();
      }
    } catch (e) {
      console.warn('Error loading video in YT Player:', e);
    }
  }

  tryDirectAudioFallback() {
    // Invidious / Piped audio proxy fallback for embedding-restricted videos
    if (!this.currentTrack?.id) return;
    const invidiousInstances = [
      `https://inv.tux.pizza/latest_version?id=${this.currentTrack.id}&itag=140`,
      `https://y.com.sb/latest_version?id=${this.currentTrack.id}&itag=140`,
      `https://invidious.nerdvpn.de/latest_version?id=${this.currentTrack.id}&itag=140`
    ];

    if (!this.fallbackAudio) {
      this.fallbackAudio = new Audio();
      this.fallbackAudio.addEventListener('playing', () => {
        this.isPlaying = true;
        this.startProgressTimer();
        this.updateMediaSessionState('playing');
        this.emit();
      });
      this.fallbackAudio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.stopProgressTimer();
        this.updateMediaSessionState('paused');
        this.emit();
      });
      this.fallbackAudio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.stopProgressTimer();
        this.emitEvent('ended');
      });
    }

    this.fallbackAudio.src = invidiousInstances[0];
    this.fallbackAudio.volume = this.volume;
    this.fallbackAudio.play().catch(err => {
      console.warn('Fallback stream failed:', err);
      // Auto-advance to next track in queue if track is unplayable
      this.emitEvent('ended');
    });
  }

  playTrack(track) {
    if (!track || !track.id) return;
    this.currentTrack = track;
    this.currentTime = 0;
    this.duration = track.duration || 0;
    this.isPlaying = true;

    if (this.fallbackAudio) {
      this.fallbackAudio.pause();
      this.fallbackAudio.src = '';
    }

    if (this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
      this.loadAndPlay(track.id);
    } else {
      // Retry once player is ready
      let attempts = 0;
      const checkReady = setInterval(() => {
        attempts++;
        if (this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
          clearInterval(checkReady);
          this.loadAndPlay(track.id);
        } else if (attempts > 15) {
          clearInterval(checkReady);
          this.tryDirectAudioFallback();
        }
      }, 200);
    }

    this.updateMediaSessionMetadata(track);
    this.emit();
  }

  pause() {
    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      this.ytPlayer.pauseVideo();
    }
    if (this.fallbackAudio && !this.fallbackAudio.paused) {
      this.fallbackAudio.pause();
    }
    this.isPlaying = false;
    this.emit();
  }

  resume() {
    if (this.fallbackAudio && this.fallbackAudio.src && this.fallbackAudio.paused) {
      this.fallbackAudio.play().catch(() => {});
    } else if (this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
      this.ytPlayer.playVideo();
    }
    this.isPlaying = true;
    this.emit();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  seek(seconds) {
    if (this.fallbackAudio && this.fallbackAudio.src) {
      this.fallbackAudio.currentTime = seconds;
      this.currentTime = seconds;
      this.emit();
    } else if (this.ytPlayer && typeof this.ytPlayer.seekTo === 'function') {
      this.ytPlayer.seekTo(seconds, true);
      this.currentTime = seconds;
      this.emit();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      this.ytPlayer.setVolume(this.volume * 100);
    }
    if (this.fallbackAudio) {
      this.fallbackAudio.volume = this.volume;
    }
    this.emit();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ytPlayer) {
      if (this.isMuted) {
        this.ytPlayer.mute();
      } else {
        this.ytPlayer.unMute();
      }
    }
    this.emit();
  }

  startProgressTimer() {
    this.stopProgressTimer();
    this.progressInterval = setInterval(() => {
      if (this.fallbackAudio && this.fallbackAudio.src && !this.fallbackAudio.paused) {
        this.currentTime = this.fallbackAudio.currentTime || 0;
        const dur = this.fallbackAudio.duration;
        if (dur && !isNaN(dur) && dur > 0) this.duration = dur;
        this.emit();
      } else if (this.ytPlayer && typeof this.ytPlayer.getCurrentTime === 'function') {
        this.currentTime = this.ytPlayer.getCurrentTime() || 0;
        const dur = this.ytPlayer.getDuration();
        if (dur && dur > 0) this.duration = dur;
        this.emit();
      }
    }, 250);
  }

  stopProgressTimer() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.resume());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) this.seek(details.seekTime);
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => this.emitEvent('prev'));
      navigator.mediaSession.setActionHandler('nexttrack', () => this.emitEvent('next'));
    }
  }

  updateMediaSessionMetadata(track) {
    if ('mediaSession' in navigator && track) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'Liquid Music',
        artwork: [
          { src: track.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500', sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    }
  }

  updateMediaSessionState(state) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit() {
    for (const listener of this.listeners) {
      listener({
        currentTrack: this.currentTrack,
        isPlaying: this.isPlaying,
        currentTime: this.currentTime,
        duration: this.duration,
        volume: this.volume,
        isMuted: this.isMuted
      });
    }
  }

  emitEvent(eventName, data) {
    window.dispatchEvent(new CustomEvent(`audio:${eventName}`, { detail: data }));
  }

  on(eventName, callback) {
    window.addEventListener(`audio:${eventName}`, callback);
  }

  off(eventName, callback) {
    window.removeEventListener(`audio:${eventName}`, callback);
  }
}

export const audioEngine = new AudioEngine();
