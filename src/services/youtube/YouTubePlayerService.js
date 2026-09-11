/**
 * YouTubePlayerService
 * Manages the YouTube IFrame API instance and player lifecycle.
 * Provides resilient initialization, embedding error detection (codes 101/150),
 * volume scaling, and fine-grained player state events.
 */

import { MusicError, ErrorCodes } from '../../core/errors/MusicError';

class YouTubePlayerService {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.pendingVideoId = null;
    this.listeners = new Set();
    this.initAttempts = 0;

    this.initIframeAPI();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    for (const listener of this.listeners) {
      try {
        listener(event, data);
      } catch (err) {
        console.error('YouTubePlayer listener error:', err);
      }
    }
  }

  initIframeAPI() {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      this.createPlayerInstance();
      return;
    }

    // Check if script tag already exists
    const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (!existing) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(tag, firstScript);
      } else {
        document.head.appendChild(tag);
      }
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevCallback === 'function') {
        try { prevCallback(); } catch {}
      }
      this.createPlayerInstance();
    };
  }

  createPlayerInstance() {
    if (this.player || typeof window === 'undefined' || !window.YT?.Player) return;

    let container = document.getElementById('yt-audio-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'yt-audio-container';
      container.style.position = 'fixed';
      container.style.bottom = '0px';
      container.style.left = '0px';
      container.style.width = '240px';
      container.style.height = '240px';
      container.style.opacity = '0.001';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-999';
      document.body.appendChild(container);
    }

    const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);
    const origin = isElectron ? 'https://www.youtube.com' : (window.location.origin || 'https://www.youtube.com');

    try {
      this.player = new window.YT.Player('yt-audio-container', {
        height: '240',
        width: '240',
        host: 'https://www.youtube.com',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin
        },
        events: {
          onReady: () => {
            this.isReady = true;
            this.notify('ready');

            if (this.pendingVideoId) {
              const vid = this.pendingVideoId;
              this.pendingVideoId = null;
              this.loadVideo(vid);
            }
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              this.notify('playing', { duration: this.getDuration() });
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              this.notify('paused');
            } else if (e.data === window.YT.PlayerState.ENDED) {
              this.notify('ended');
            } else if (e.data === window.YT.PlayerState.BUFFERING) {
              this.notify('buffering');
            }
          },
          onError: (e) => {
            console.warn('YouTube Player Error code:', e.data);
            const isEmbedRestricted = e.data === 150 || e.data === 101 || e.data === 5 || e.data === 2;
            const error = new MusicError({
              code: isEmbedRestricted ? ErrorCodes.EMBED_RESTRICTED : ErrorCodes.PLAYER_REQUEST_FAILED,
              userMessage: isEmbedRestricted 
                ? 'Direct embedding restricted by YouTube. Switching to high-res stream fallback...'
                : 'YouTube playback encountered an issue. Retrying with fallback stream...',
              diagnostic: `YouTube Player error code ${e.data}`,
              retryable: true
            });

            this.notify('error', { error, isEmbedRestricted, rawCode: e.data });
          }
        }
      });
    } catch (err) {
      console.warn('Error instantiating YT.Player:', err);
    }
  }

  loadVideo(videoId, startSeconds = 0) {
    if (!videoId) return;

    if (!this.isReady || !this.player || typeof this.player.loadVideoById !== 'function') {
      this.pendingVideoId = videoId;
      return;
    }

    try {
      this.player.loadVideoById({
        videoId,
        startSeconds,
        suggestedQuality: 'small'
      });
      this.player.playVideo();
    } catch (err) {
      console.warn('loadVideoById failed:', err);
      this.notify('error', {
        error: new MusicError({
          code: ErrorCodes.PLAYER_REQUEST_FAILED,
          userMessage: 'Failed to load video on YouTube player.',
          originalError: err
        }),
        isEmbedRestricted: true
      });
    }
  }

  play() {
    if (this.player?.playVideo) {
      try {
        this.player.playVideo();
      } catch {}
    }
  }

  pause() {
    if (this.player?.pauseVideo) {
      try {
        this.player.pauseVideo();
      } catch {}
    }
  }

  seekTo(seconds) {
    if (this.player?.seekTo) {
      try {
        this.player.seekTo(seconds, true);
      } catch {}
    }
  }

  setVolume(percent) {
    if (this.player?.setVolume) {
      try {
        this.player.setVolume(Math.max(0, Math.min(100, percent)));
      } catch {}
    }
  }

  mute() {
    if (this.player?.mute) {
      try {
        this.player.mute();
      } catch {}
    }
  }

  unMute() {
    if (this.player?.unMute) {
      try {
        this.player.unMute();
      } catch {}
    }
  }

  getCurrentTime() {
    if (this.player?.getCurrentTime) {
      try {
        return this.player.getCurrentTime() || 0;
      } catch {}
    }
    return 0;
  }

  getDuration() {
    if (this.player?.getDuration) {
      try {
        return this.player.getDuration() || 0;
      } catch {}
    }
    return 0;
  }

  destroy() {
    if (this.player?.destroy) {
      try {
        this.player.destroy();
      } catch {}
    }
    this.player = null;
    this.isReady = false;
  }
}

export const ytPlayerService = new YouTubePlayerService();
