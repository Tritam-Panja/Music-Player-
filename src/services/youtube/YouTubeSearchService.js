/**
 * YouTubeSearchService
 * High-reliability unified music search service with controlled fallback hierarchy.
 * Operates completely standalone in Guest Mode without requiring an Express backend.
 * Self-contained for Android APK (Capacitor) and Browser environments.
 */

import { MusicError, ErrorCodes } from '../../core/errors/MusicError';
import { ytSessionService, CLIENT_STRATEGIES } from './YouTubeSessionService';
import { cleanTrackTitle } from '../../utils/formatters';

// Health-scored public fallback instances with health tracking
const PUBLIC_INSTANCES = [
  { url: 'https://inv.tux.pizza', failures: 0, lastCheck: 0 },
  { url: 'https://invidious.nerdvpn.de', failures: 0, lastCheck: 0 },
  { url: 'https://invidious.jing.rocks', failures: 0, lastCheck: 0 },
  { url: 'https://yt.drgnz.club', failures: 0, lastCheck: 0 }
];

class YouTubeSearchService {
  constructor() {
    this.searchCache = new Map(); // query -> { results, timestamp }
    this.suggestionsCache = new Map(); // query -> { suggestions, timestamp }
    this.currentAbortController = null;
    this.CACHE_TTL = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Normalize any raw track structure into a uniform Liquid Music domain track object
   */
  normalizeTrack(raw) {
    if (!raw) return null;

    const id = raw.id || raw.videoId || (raw.url ? raw.url.replace('/watch?v=', '') : null);
    if (!id) return null;

    const rawTitle = raw.title || 'Unknown Title';
    const cleanTitle = cleanTrackTitle(typeof rawTitle === 'string' ? rawTitle : (rawTitle.runs?.[0]?.text || 'Unknown Title'));

    let artistName = 'Unknown Artist';
    if (typeof raw.artist === 'string' && raw.artist.trim()) {
      artistName = raw.artist.trim();
    } else if (raw.author) {
      artistName = typeof raw.author === 'string' ? raw.author : (raw.author.name || 'Unknown Artist');
    } else if (raw.channel?.name) {
      artistName = raw.channel.name;
    } else if (raw.ownerText?.runs?.[0]?.text) {
      artistName = raw.ownerText.runs[0].text;
    }

    let durationSec = 210;
    if (typeof raw.duration === 'number' && raw.duration > 0) {
      durationSec = raw.duration > 10000 ? Math.floor(raw.duration / 1000) : Math.floor(raw.duration);
    } else if (raw.lengthSeconds) {
      durationSec = parseInt(raw.lengthSeconds, 10) || 210;
    }

    let thumb = raw.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    if (typeof thumb === 'object' && thumb.url) {
      thumb = thumb.url;
    }

    return {
      id,
      videoId: id,
      title: cleanTitle,
      artist: artistName,
      album: raw.album || 'Single',
      duration: durationSec,
      thumbnail: thumb,
      source: 'youtube',
      playable: true,
      metadata: {
        views: raw.views || 0,
        uploaded: raw.uploaded || raw.publishedText || ''
      }
    };
  }

  /**
   * Main Unified Search Entry Point
   */
  async search(query, type = 'video') {
    if (!query || !query.trim()) return [];
    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `${normalizedQuery}:${type}`;

    // 1. Check in-memory cache
    const cached = this.searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
      return cached.results;
    }

    // Cancel in-flight previous search request
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }
    this.currentAbortController = new AbortController();
    const signal = this.currentAbortController.signal;

    let results = [];
    let lastError = null;

    // PROVIDER 1: Electron Native IPC (Zero-CORS, fastest on desktop)
    if (typeof window !== 'undefined' && window.electronAPI?.search) {
      try {
        const ipcRes = await window.electronAPI.search(query, type);
        if (ipcRes?.success && Array.isArray(ipcRes.results) && ipcRes.results.length > 0) {
          results = ipcRes.results.map(t => this.normalizeTrack(t)).filter(Boolean);
          this.setCache(cacheKey, results);
          return results;
        }
      } catch (err) {
        lastError = err;
      }
    }

    // PROVIDER 2: Local Vite dev plugin or intentionally configured backend (/api/search)
    // Only attempt if not running inside Android APK with no backend configured
    try {
      const isApk = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
      const hasBackendConfigured = Boolean(import.meta.env?.VITE_API_URL);

      if (!isApk || hasBackendConfigured) {
        const timeoutCtrl = new AbortController();
        const timeoutId = setTimeout(() => timeoutCtrl.abort(), 3500);

        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`, {
          signal: timeoutCtrl.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.results) && data.results.length > 0) {
            results = data.results.map(t => this.normalizeTrack(t)).filter(Boolean);
            this.setCache(cacheKey, results);
            return results;
          }
        }
      }
    } catch {}

    // PROVIDER 3: Direct InnerTube / YouTube Music Client API
    try {
      const strategy = ytSessionService.getActiveStrategy();
      const context = ytSessionService.getContext(strategy);
      const headers = ytSessionService.getHeaders(strategy);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const endpoint = strategy.id === 'WEB_REMIX' 
        ? 'https://music.youtube.com/youtubei/v1/search'
        : 'https://www.youtube.com/youtubei/v1/search';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          context,
          query
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const parsed = this.parseInnerTubeResponse(data);
        if (parsed.length > 0) {
          ytSessionService.reportSuccess(strategy.id);
          results = parsed.map(t => this.normalizeTrack(t)).filter(Boolean);
          this.setCache(cacheKey, results);
          return results;
        }
      } else {
        ytSessionService.reportFailure(strategy.id);
      }
    } catch (err) {
      ytSessionService.reportFailure(ytSessionService.getActiveStrategy().id);
      lastError = err;
    }

    // PROVIDER 4: Healthy Invidious / Piped Instance Rotation with health metrics
    const sortedInstances = [...PUBLIC_INSTANCES].sort((a, b) => a.failures - b.failures);

    for (const inst of sortedInstances.slice(0, 2)) {
      if (signal.aborted) break;

      try {
        const instCtrl = new AbortController();
        const instTimeout = setTimeout(() => instCtrl.abort(), 3500);

        const typeParam = type === 'playlist' ? 'playlist' : 'video';
        const res = await fetch(`${inst.url}/api/v1/search?q=${encodeURIComponent(query)}&type=${typeParam}`, {
          signal: instCtrl.signal
        });
        clearTimeout(instTimeout);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            inst.failures = Math.max(0, inst.failures - 1);
            results = data.map(item => this.normalizeTrack({
              id: item.videoId || item.playlistId,
              title: item.title,
              artist: item.author,
              duration: item.lengthSeconds,
              thumbnail: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
              views: item.viewCount,
              uploaded: item.publishedText
            })).filter(Boolean);

            this.setCache(cacheKey, results);
            return results;
          }
        } else {
          inst.failures++;
        }
      } catch (e) {
        inst.failures++;
      }
    }

    if (results.length > 0) {
      this.setCache(cacheKey, results);
      return results;
    }

    return [];
  }

  /**
   * Parse InnerTube response format (both YouTube Music and standard YouTube)
   */
  parseInnerTubeResponse(data) {
    const tracks = [];
    try {
      // 1. YouTube Music format
      const musicSections = data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
      for (const section of musicSections) {
        // Top Hit Card Shelf (featured song or artist)
        const card = section?.musicCardShelfRenderer;
        if (card) {
          const cardTitle = card?.title?.runs?.[0]?.text;
          const cardSubtitle = card?.subtitle?.runs?.[0]?.text;
          const cardVideoId = card?.onTap?.watchEndpoint?.videoId || card?.buttons?.[0]?.buttonRenderer?.command?.watchEndpoint?.videoId;
          const cardThumb = card?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url;
          if (cardVideoId && cardTitle) {
            tracks.push({
              id: cardVideoId,
              title: cardTitle,
              artist: cardSubtitle || 'Artist',
              thumbnail: cardThumb || ('https://i.ytimg.com/vi/' + cardVideoId + '/hqdefault.jpg')
            });
          }
        }

        // Standard Music Shelf
        const items = section?.musicShelfRenderer?.contents || [];
        for (const item of items) {
          const flexColumns = item?.musicResponsiveListItemRenderer?.flexColumns || [];
          const title = flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
          const artist = flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
          const videoId = item?.musicResponsiveListItemRenderer?.playlistItemData?.videoId || item?.musicResponsiveListItemRenderer?.doubleTapEndpoint?.watchEndpoint?.videoId;
          const thumbUrl = item?.musicResponsiveListItemRenderer?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url;

          if (videoId && title) {
            tracks.push({
              id: videoId,
              title,
              artist: artist || 'Unknown Artist',
              thumbnail: thumbUrl || ('https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg')
            });
          }
        }
      }

      if (tracks.length > 0) return tracks;

      // 2. Standard Desktop & Mobile YouTube format
      const standardSections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || data?.contents?.sectionListRenderer?.contents || [];
      for (const section of standardSections) {
        const items = section.itemSectionRenderer?.contents || [];
        for (const item of items) {
          const r = item.videoRenderer || item.compactVideoRenderer;
          if (r && r.videoId) {
            const title = r.title?.runs?.[0]?.text || r.title?.simpleText;
            const artist = r.longBylineText?.runs?.[0]?.text || r.shortBylineText?.runs?.[0]?.text || r.ownerText?.runs?.[0]?.text || 'Unknown Artist';
            const thumb = r.thumbnail?.thumbnails?.[r.thumbnail.thumbnails.length - 1]?.url;
            const lengthSec = r.lengthText?.simpleText ? this.parseDurationToSec(r.lengthText.simpleText) : 210;
            if (title) {
              tracks.push({
                id: r.videoId,
                title,
                artist,
                duration: lengthSec,
                thumbnail: thumb || ('https://i.ytimg.com/vi/' + r.videoId + '/hqdefault.jpg')
              });
            }
          }
        }
      }
    } catch {}

    return tracks;
  }

  parseDurationToSec(str) {
    if (!str || typeof str !== 'string') return 210;
    const parts = str.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 210;
  }

  async getSuggestions(query) {
    if (!query || !query.trim() || query.trim().length < 2) return [];
    const normalized = query.trim().toLowerCase();

    const cached = this.suggestionsCache.get(normalized);
    if (cached && Date.now() - cached.timestamp < 1000 * 60 * 10) {
      return cached.suggestions;
    }

    // 1. Electron IPC
    if (typeof window !== 'undefined' && window.electronAPI?.getSuggestions) {
      try {
        const suggs = await window.electronAPI.getSuggestions(query);
        if (Array.isArray(suggs) && suggs.length > 0) {
          this.suggestionsCache.set(normalized, { suggestions: suggs, timestamp: Date.now() });
          return suggs;
        }
      } catch {}
    }

    // 2. Google Suggest Client (Fastest, zero-cors JSONP/direct client)
    try {
      const res = await fetch(`https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&hl=en&gl=us&ds=yt&q=${encodeURIComponent(query)}`);
      const text = await res.text();
      const match = text.match(/^[^(]*\((.*)\);?$/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed[1])) {
          const list = parsed[1].map(item => item[0]).filter(Boolean);
          this.suggestionsCache.set(normalized, { suggestions: list, timestamp: Date.now() });
          return list;
        }
      }
    } catch {}

    return [];
  }

  /**
   * Get global trending charts
   */
  async getTrending() {
    // Check if electron has it
    if (typeof window !== 'undefined' && window.electronAPI?.getTrending) {
      try {
        const res = await window.electronAPI.getTrending();
        if (res?.success && Array.isArray(res.results)) {
          return res.results.map(t => this.normalizeTrack(t)).filter(Boolean);
        }
      } catch {}
    }

    // Default top global trending query
    return await this.search('Top Global Hits 2026', 'video');
  }

  setCache(key, results) {
    if (this.searchCache.size > 100) {
      // Evict oldest
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }
    this.searchCache.set(key, { results, timestamp: Date.now() });
  }
}

export const ytSearchService = new YouTubeSearchService();
