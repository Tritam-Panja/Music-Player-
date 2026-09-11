/**
 * YouTubeSessionService
 * Centralizes YouTube client configurations, visitor data, and session context.
 * Provides resilient, multi-client strategy rotation instead of hardcoding one client forever.
 */

import { MusicError, ErrorCodes } from '../../core/errors/MusicError';

export const CLIENT_STRATEGIES = {
  WEB_REMIX: {
    id: 'WEB_REMIX',
    clientName: 'WEB_REMIX',
    clientVersion: '1.20250101.01.00',
    osName: 'Windows',
    osVersion: '10.0',
    platform: 'DESKTOP',
    hl: 'en',
    gl: 'US',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  },
  WEB: {
    id: 'WEB',
    clientName: 'WEB',
    clientVersion: '2.20240101.00.00',
    osName: 'Windows',
    osVersion: '10.0',
    platform: 'DESKTOP',
    hl: 'en',
    gl: 'US',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  ANDROID_MUSIC: {
    id: 'ANDROID_MUSIC',
    clientName: 'ANDROID_MUSIC',
    clientVersion: '6.40.52',
    osName: 'Android',
    osVersion: '14',
    platform: 'MOBILE',
    hl: 'en',
    gl: 'US',
    userAgent: 'com.google.android.apps.youtube.music/6.40.52 (Linux; U; Android 14; Pixel 8 Pro) gzip'
  }
};

const VISITOR_DATA_KEY = 'liquid_yt_visitor_data';
const VISITOR_TTL = 1000 * 60 * 60 * 24; // 24 hours

class YouTubeSessionService {
  constructor() {
    this.currentStrategy = CLIENT_STRATEGIES.WEB_REMIX;
    this.visitorData = this.loadCachedVisitorData();
    this.clientHealth = {
      WEB_REMIX: { failures: 0, lastFailure: 0 },
      WEB: { failures: 0, lastFailure: 0 },
      ANDROID_MUSIC: { failures: 0, lastFailure: 0 }
    };
  }

  loadCachedVisitorData() {
    try {
      const raw = localStorage.getItem(VISITOR_DATA_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < VISITOR_TTL) {
        return parsed.data;
      }
    } catch {}
    return null;
  }

  setVisitorData(data) {
    if (!data) return;
    this.visitorData = data;
    try {
      localStorage.setItem(VISITOR_DATA_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch {}
  }

  /**
   * Get active InnerTube context for API payloads
   */
  getContext(strategyOverride = null) {
    const strategy = strategyOverride || this.getActiveStrategy();
    const context = {
      client: {
        clientName: strategy.clientName,
        clientVersion: strategy.clientVersion,
        hl: strategy.hl,
        gl: strategy.gl,
        osName: strategy.osName,
        osVersion: strategy.osVersion,
        platform: strategy.platform
      }
    };

    if (this.visitorData) {
      context.client.visitorData = this.visitorData;
    }

    return context;
  }

  /**
   * Get headers required for InnerTube calls
   */
  getHeaders(strategyOverride = null, authHeader = null) {
    const strategy = strategyOverride || this.getActiveStrategy();
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': strategy.userAgent
    };

    if (strategy.id === 'WEB_REMIX') {
      headers['X-YouTube-Client-Name'] = '67';
      headers['X-YouTube-Client-Version'] = strategy.clientVersion;
    }

    if (authHeader) {
      if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        headers['Authorization'] = authHeader;
      } else if (typeof authHeader === 'string' && authHeader.includes('=')) {
        headers['Cookie'] = authHeader;
      }
    }

    return headers;
  }

  /**
   * Mark a strategy failure and rotate if threshold is exceeded
   */
  reportFailure(strategyId) {
    const health = this.clientHealth[strategyId];
    if (health) {
      health.failures++;
      health.lastFailure = Date.now();
    }

    // Auto-rotate to alternative strategy if current fails repeatedly
    if (strategyId === 'WEB_REMIX' && health && health.failures >= 2) {
      this.currentStrategy = CLIENT_STRATEGIES.WEB;
    } else if (strategyId === 'WEB' && health && health.failures >= 2) {
      this.currentStrategy = CLIENT_STRATEGIES.ANDROID_MUSIC;
    }
  }

  reportSuccess(strategyId) {
    const health = this.clientHealth[strategyId];
    if (health) {
      health.failures = 0;
    }
  }

  getActiveStrategy() {
    return this.currentStrategy;
  }

  resetStrategy() {
    this.currentStrategy = CLIENT_STRATEGIES.WEB_REMIX;
  }
}

export const ytSessionService = new YouTubeSessionService();
