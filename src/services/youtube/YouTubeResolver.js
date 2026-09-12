/**
 * YouTubeResolver
 * Resolves and validates playable audio streams for tracks.
 * Handles HTTP 403 detection, stream expiration, format negotiation, and fallback rotation.
 */

import { MusicError, ErrorCodes } from '../../core/errors/MusicError';
import { apiUrl } from '../apiConfig';

const RESOLVER_INSTANCES = [
  { baseUrl: 'https://inv.nadeko.net', healthy: true, failures: 0 },
  { baseUrl: 'https://invidious.nerdvpn.de', healthy: true, failures: 0 },
  { baseUrl: 'https://inv.tux.pizza', healthy: true, failures: 0 }
];

class YouTubeResolver {
  constructor() {
    this.streamCache = new Map(); // videoId -> { streamUrl, expiresAt, format }
  }

  /**
   * Resolve a validated, playable direct audio stream URL for a track
   */
  async resolveAudioStream(videoId) {
    if (!videoId) {
      throw new MusicError({
        code: ErrorCodes.STREAM_RESOLUTION_FAILED,
        userMessage: 'Invalid track ID for stream resolution.'
      });
    }

    // 1. Check cached stream
    const cached = this.streamCache.get(videoId);
    if (cached && Date.now() < cached.expiresAt) {
      return cached;
    }

    // 2. Check local/configured backend stream proxy first if available
    try {
      const proxyUrl = apiUrl(`/api/stream-proxy?videoId=${encodeURIComponent(videoId)}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data && data.streamUrl) {
          const streamInfo = {
            streamUrl: data.streamUrl,
            format: data.format || 'audio/mp4',
            expiresAt: Date.now() + 1000 * 60 * 30
          };
          this.streamCache.set(videoId, streamInfo);
          return streamInfo;
        }
      }
    } catch {}

    // 3. Iterate through resolver instances with strict validation
    const activeInstances = [...RESOLVER_INSTANCES].sort((a, b) => a.failures - b.failures);

    for (const inst of activeInstances) {
      try {
        const streamInfo = await this.fetchStreamFromInstance(inst.baseUrl, videoId);
        if (streamInfo && streamInfo.streamUrl) {
          const isValid = await this.validateStreamUrl(streamInfo.streamUrl);
          if (isValid) {
            inst.failures = Math.max(0, inst.failures - 1);
            this.streamCache.set(videoId, streamInfo);
            return streamInfo;
          } else {
            inst.failures++;
          }
        }
      } catch {
        inst.failures++;
      }
    }

    // No valid fallback stream found
    return null;
  }

  /**
   * Query Invidious API for audio-only adaptive stream URLs
   */
  async fetchStreamFromInstance(baseUrl, videoId) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${baseUrl}/api/v1/videos/${videoId}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      if (res.status === 403) {
        throw new MusicError({ code: ErrorCodes.STREAM_403 });
      }
      throw new Error(`Instance returned status ${res.status}`);
    }

    const data = await res.json();
    const adaptiveFormats = data.adaptiveFormats || [];

    const audioFormats = adaptiveFormats.filter(f => f.type && f.type.startsWith('audio/'));
    audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

    if (audioFormats.length > 0) {
      const bestAudio = audioFormats[0];
      const streamUrl = bestAudio.url;

      let expiresAt = Date.now() + 1000 * 60 * 60 * 2;
      try {
        const parsedUrl = new URL(streamUrl);
        const expParam = parsedUrl.searchParams.get('expire');
        if (expParam) {
          const expSeconds = parseInt(expParam, 10);
          if (expSeconds > 0) {
            expiresAt = (expSeconds * 1000) - (1000 * 60 * 5);
          }
        }
      } catch {}

      return {
        streamUrl,
        format: bestAudio.type,
        bitrate: bestAudio.bitrate,
        expiresAt
      };
    }

    return null;
  }

  /**
   * Validate that a stream URL is reachable and does not return 403 or 404
   */
  async validateStreamUrl(url) {
    if (!url) return false;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });
      clearTimeout(timeout);

      return res.status === 200 || res.status === 206 || res.status === 302;
    } catch {
      return false;
    }
  }

  /**
   * Evict cache for a specific video if it throws 403 during playback
   */
  invalidate(videoId) {
    this.streamCache.delete(videoId);
  }
}

export const ytResolver = new YouTubeResolver();
