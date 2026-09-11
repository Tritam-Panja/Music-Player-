/**
 * Centralized Error Taxonomy for Liquid Music
 * Standardizes errors across search, player, session, and platform adapters.
 */

export const ErrorCodes = {
  // Search Errors
  SEARCH_REQUEST_FAILED: 'SEARCH_REQUEST_FAILED',
  SEARCH_EMPTY: 'SEARCH_EMPTY',
  SEARCH_TIMEOUT: 'SEARCH_TIMEOUT',

  // Session & Auth Errors
  SESSION_INITIALIZATION_FAILED: 'SESSION_INITIALIZATION_FAILED',
  SESSION_VALIDATION_FAILED: 'SESSION_VALIDATION_FAILED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  VISITOR_DATA_FAILED: 'VISITOR_DATA_FAILED',
  CLIENT_REJECTED: 'CLIENT_REJECTED',
  AUTH_CANCELLED: 'AUTH_CANCELLED',

  // Playback & Stream Errors
  PLAYER_REQUEST_FAILED: 'PLAYER_REQUEST_FAILED',
  STREAM_RESOLUTION_FAILED: 'STREAM_RESOLUTION_FAILED',
  STREAM_403: 'STREAM_403',
  STREAM_EXPIRED: 'STREAM_EXPIRED',
  NO_AUDIO_FORMAT: 'NO_AUDIO_FORMAT',
  AUDIO_DECODE_FAILED: 'AUDIO_DECODE_FAILED',
  TRACK_UNAVAILABLE: 'TRACK_UNAVAILABLE',
  EMBED_RESTRICTED: 'EMBED_RESTRICTED',

  // Network & Provider Errors
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE'
};

const USER_FRIENDLY_MESSAGES = {
  [ErrorCodes.SEARCH_REQUEST_FAILED]: 'Unable to search for tracks. Please check your connection.',
  [ErrorCodes.SEARCH_EMPTY]: 'No tracks found matching your query.',
  [ErrorCodes.SEARCH_TIMEOUT]: 'Search took too long to respond. Retrying...',
  [ErrorCodes.SESSION_INITIALIZATION_FAILED]: 'Could not initialize YouTube session.',
  [ErrorCodes.SESSION_VALIDATION_FAILED]: 'Failed to validate YouTube connection. Check credentials or try again.',
  [ErrorCodes.SESSION_EXPIRED]: 'YouTube session expired. Please reconnect.',
  [ErrorCodes.VISITOR_DATA_FAILED]: 'Could not establish YouTube client handshake.',
  [ErrorCodes.CLIENT_REJECTED]: 'YouTube rejected request with current client configuration.',
  [ErrorCodes.AUTH_CANCELLED]: 'Authentication was cancelled.',
  [ErrorCodes.PLAYER_REQUEST_FAILED]: 'Playback could not be started for this track.',
  [ErrorCodes.STREAM_RESOLUTION_FAILED]: 'Could not resolve playable audio stream.',
  [ErrorCodes.STREAM_403]: 'Audio stream expired or restricted. Attempting fallback...',
  [ErrorCodes.STREAM_EXPIRED]: 'Audio link expired. Refreshing stream...',
  [ErrorCodes.NO_AUDIO_FORMAT]: 'No compatible audio stream format available.',
  [ErrorCodes.AUDIO_DECODE_FAILED]: 'Audio decoder failed on current format.',
  [ErrorCodes.TRACK_UNAVAILABLE]: 'This track is restricted or unavailable in your region.',
  [ErrorCodes.EMBED_RESTRICTED]: 'Playback restricted by copyright holder. Switching to alternative stream...',
  [ErrorCodes.NETWORK_TIMEOUT]: 'Network request timed out. Please check your internet connection.',
  [ErrorCodes.NETWORK_OFFLINE]: 'No active internet connection detected.',
  [ErrorCodes.PROVIDER_UNAVAILABLE]: 'Music provider is currently unreachable. Switching provider...'
};

export class MusicError extends Error {
  constructor({
    code,
    message,
    userMessage,
    diagnostic = '',
    retryable = false,
    provider = 'system',
    originalError = null
  }) {
    super(message || USER_FRIENDLY_MESSAGES[code] || 'An unexpected music engine error occurred.');
    this.name = 'MusicError';
    this.code = code || 'UNKNOWN_ERROR';
    this.userMessage = userMessage || USER_FRIENDLY_MESSAGES[code] || this.message;
    this.diagnostic = diagnostic || (originalError ? originalError.message : '');
    this.retryable = retryable;
    this.provider = provider;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }

  static isMusicError(err) {
    return err instanceof MusicError || (err && typeof err === 'object' && 'code' in err && 'userMessage' in err);
  }

  static from(err, fallbackCode = ErrorCodes.PLAYER_REQUEST_FAILED) {
    if (MusicError.isMusicError(err)) return err;

    let code = fallbackCode;
    let retryable = false;

    if (err?.name === 'AbortError' || err?.message?.includes('timeout')) {
      code = ErrorCodes.NETWORK_TIMEOUT;
      retryable = true;
    } else if (err?.message?.includes('403')) {
      code = ErrorCodes.STREAM_403;
      retryable = true;
    } else if (!navigator.onLine) {
      code = ErrorCodes.NETWORK_OFFLINE;
      retryable = true;
    }

    return new MusicError({
      code,
      message: err?.message || 'Unexpected failure',
      diagnostic: err?.stack || err?.message,
      retryable,
      originalError: err
    });
  }
}
