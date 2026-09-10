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
      container.style.bottom = '-9999px';
      container.style.right = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
    }

    this.ytPlayer = new window.YT.Player('yt-audio-container', {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        playsinline: 1
      },
      events: {
        onReady: (event) => {
          this.isReady = true;
          this.ytPlayer.setVolume(this.volume * 100);
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
          console.warn('Audio playback warning:', e.data);
          // If a video has embedding restrictions, skip to next or notify
          this.emitEvent('error', e.data);
        }
      }
    });
  }

  playTrack(track) {
    if (!track || !track.id) return;
    this.currentTrack = track;
    this.currentTime = 0;
    this.duration = track.duration || 0;
    this.isPlaying = true;

    if (this.ytPlayer && this.ytPlayer.loadVideoById) {
      this.ytPlayer.loadVideoById(track.id);
      this.ytPlayer.playVideo();
    } else {
      // Retry once player is ready
      const checkReady = setInterval(() => {
        if (this.ytPlayer && this.ytPlayer.loadVideoById) {
          clearInterval(checkReady);
          this.ytPlayer.loadVideoById(track.id);
          this.ytPlayer.playVideo();
        }
      }, 200);
    }

    this.updateMediaSessionMetadata(track);
    this.emit();
  }

  pause() {
    if (this.ytPlayer && this.ytPlayer.pauseVideo) {
      this.ytPlayer.pauseVideo();
    }
    this.isPlaying = false;
    this.emit();
  }

  resume() {
    if (this.ytPlayer && this.ytPlayer.playVideo) {
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
    if (this.ytPlayer && this.ytPlayer.seekTo) {
      this.ytPlayer.seekTo(seconds, true);
      this.currentTime = seconds;
      this.emit();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ytPlayer && this.ytPlayer.setVolume) {
      this.ytPlayer.setVolume(this.volume * 100);
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
      if (this.ytPlayer && this.ytPlayer.getCurrentTime) {
        this.currentTime = this.ytPlayer.getCurrentTime();
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
