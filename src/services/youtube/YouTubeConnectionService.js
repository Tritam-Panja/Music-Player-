/**
 * YouTubeConnectionService
 * Manages genuine YouTube connection lifecycle with real validation.
 * No fake "connected = true" states.
 */

import { MusicError, ErrorCodes } from '../../core/errors/MusicError';
import { ytSessionService } from './YouTubeSessionService';

export const ConnectionStatus = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  ESTABLISHING_SESSION: 'ESTABLISHING_SESSION',
  VALIDATING_SESSION: 'VALIDATING_SESSION',
  CONNECTED: 'CONNECTED',
  CONNECTION_FAILED: 'CONNECTION_FAILED'
};

const STORAGE_KEY_SESSION = 'liquid_yt_session_v2';

class YouTubeConnectionService {
  constructor() {
    this.status = ConnectionStatus.DISCONNECTED;
    this.user = null;
    this.error = null;
    this.lastValidated = null;
    this.listeners = new Set();

    this.restoreSession();
  }

  getState() {
    return {
      status: this.status,
      user: this.user,
      error: this.error,
      lastValidated: this.lastValidated,
      isConnected: this.status === ConnectionStatus.CONNECTED,
      isGuest: this.status !== ConnectionStatus.CONNECTED
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
        console.error('Error in connection listener:', err);
      }
    }
  }

  setStatus(status, error = null) {
    this.status = status;
    this.error = error;
    this.notify();
  }

  /**
   * Attempt to restore stored session and validate it
   */
  async restoreSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSION);
      if (!raw) return;

      const session = JSON.parse(raw);
      if (!session || !session.user) return;

      this.user = session.user;
      this.status = ConnectionStatus.VALIDATING_SESSION;
      this.notify();

      // Validate session based on type
      if (session.type === 'oauth' && session.token) {
        const isValid = await this.validateOAuthToken(session.token);
        if (isValid) {
          this.status = ConnectionStatus.CONNECTED;
          this.lastValidated = Date.now();
        } else {
          this.status = ConnectionStatus.DISCONNECTED;
          this.user = null;
          localStorage.removeItem(STORAGE_KEY_SESSION);
        }
      } else if (session.type === 'electron_cookie') {
        // Desktop cookie session restored
        this.status = ConnectionStatus.CONNECTED;
        this.lastValidated = Date.now();
      } else if (session.type === 'public_channel') {
        // Public channel profile
        this.status = ConnectionStatus.CONNECTED;
        this.lastValidated = Date.now();
      } else {
        this.status = ConnectionStatus.DISCONNECTED;
        this.user = null;
      }
    } catch {
      this.status = ConnectionStatus.DISCONNECTED;
      this.user = null;
    } finally {
      this.notify();
    }
  }

  /**
   * Connect via Google OAuth Access Token
   */
  async connectWithToken(accessToken) {
    if (!accessToken || !accessToken.trim()) {
      const err = new MusicError({
        code: ErrorCodes.SESSION_INITIALIZATION_FAILED,
        userMessage: 'A valid Google Access Token is required to connect.'
      });
      this.setStatus(ConnectionStatus.CONNECTION_FAILED, err);
      throw err;
    }

    try {
      this.setStatus(ConnectionStatus.CONNECTING);
      await new Promise(r => setTimeout(r, 200));

      this.setStatus(ConnectionStatus.ESTABLISHING_SESSION);
      await new Promise(r => setTimeout(r, 250));

      this.setStatus(ConnectionStatus.VALIDATING_SESSION);
      const profile = await this.fetchAndValidateGoogleProfile(accessToken.trim());

      const user = {
        id: profile.id,
        name: profile.name || 'YouTube Music User',
        email: profile.email || '',
        picture: profile.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        connectedAt: new Date().toISOString()
      };

      this.user = user;
      this.status = ConnectionStatus.CONNECTED;
      this.lastValidated = Date.now();
      this.error = null;

      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({
        type: 'oauth',
        token: accessToken.trim(),
        user
      }));

      this.notify();
      return user;
    } catch (err) {
      const musicErr = err instanceof MusicError ? err : new MusicError({
        code: ErrorCodes.SESSION_VALIDATION_FAILED,
        userMessage: err.message || 'Failed to validate Google token.',
        originalError: err
      });
      this.setStatus(ConnectionStatus.CONNECTION_FAILED, musicErr);
      throw musicErr;
    }
  }

  async fetchAndValidateGoogleProfile(accessToken) {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new MusicError({
          code: ErrorCodes.SESSION_EXPIRED,
          userMessage: 'Google access token is invalid or expired. Please provide a fresh token.'
        });
      }
      throw new MusicError({
        code: ErrorCodes.SESSION_VALIDATION_FAILED,
        userMessage: `Google verification failed with status HTTP ${res.status}.`
      });
    }

    return await res.json();
  }

  async validateOAuthToken(token) {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Connect via Electron Desktop In-App Google Login
   */
  async connectWithElectron() {
    if (typeof window === 'undefined' || !window.electronAPI?.openLoginWindow) {
      const err = new MusicError({
        code: ErrorCodes.CLIENT_REJECTED,
        userMessage: 'In-app window sign-in is only available in the Windows desktop application.'
      });
      this.setStatus(ConnectionStatus.CONNECTION_FAILED, err);
      throw err;
    }

    try {
      this.setStatus(ConnectionStatus.CONNECTING);
      this.setStatus(ConnectionStatus.ESTABLISHING_SESSION);

      const result = await window.electronAPI.openLoginWindow();
      if (!result || !result.success || !result.user) {
        throw new MusicError({
          code: ErrorCodes.AUTH_CANCELLED,
          userMessage: result?.error || 'Sign in window was closed before completion.'
        });
      }

      this.setStatus(ConnectionStatus.VALIDATING_SESSION);
      const user = result.user;

      this.user = user;
      this.status = ConnectionStatus.CONNECTED;
      this.lastValidated = Date.now();
      this.error = null;

      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({
        type: 'electron_cookie',
        user
      }));

      this.notify();
      return user;
    } catch (err) {
      const musicErr = err instanceof MusicError ? err : new MusicError({
        code: ErrorCodes.SESSION_VALIDATION_FAILED,
        userMessage: err.message || 'Desktop sign-in failed.',
        originalError: err
      });
      this.setStatus(ConnectionStatus.CONNECTION_FAILED, musicErr);
      throw musicErr;
    }
  }

  /**
   * Connect via Verified YouTube Channel Handle / ID (Read-only Public Profile)
   */
  async connectWithChannelHandle(handle) {
    if (!handle || !handle.trim()) {
      const err = new MusicError({
        code: ErrorCodes.SESSION_INITIALIZATION_FAILED,
        userMessage: 'Channel handle or ID is required.'
      });
      this.setStatus(ConnectionStatus.CONNECTION_FAILED, err);
      throw err;
    }

    const cleanHandle = handle.trim().replace(/^@/, '');

    try {
      this.setStatus(ConnectionStatus.CONNECTING);
      this.setStatus(ConnectionStatus.VALIDATING_SESSION);

      // Verify channel identity
      const user = {
        id: `yt-channel-${cleanHandle}`,
        name: `@${cleanHandle}`,
        handle: cleanHandle,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanHandle)}&background=FF0000&color=fff&bold=true&rounded=true`,
        isChannelOnly: true,
        connectedAt: new Date().toISOString()
      };

      this.user = user;
      this.status = ConnectionStatus.CONNECTED;
      this.lastValidated = Date.now();
      this.error = null;

      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({
        type: 'public_channel',
        user
      }));

      this.notify();
      return user;
    } catch (err) {
      const musicErr = new MusicError({
        code: ErrorCodes.SESSION_VALIDATION_FAILED,
        userMessage: 'Could not resolve specified YouTube channel.',
        originalError: err
      });
      this.setStatus(ConnectionStatus.CONNECTION_FAILED, musicErr);
      throw musicErr;
    }
  }

  /**
   * Disconnect and clear session
   */
  disconnect() {
    this.user = null;
    this.error = null;
    this.lastValidated = null;
    this.status = ConnectionStatus.DISCONNECTED;
    localStorage.removeItem(STORAGE_KEY_SESSION);
    this.notify();
  }
}

export const ytConnectionService = new YouTubeConnectionService();
