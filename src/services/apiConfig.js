/**
 * Centralized API configuration supporting dynamic remote backend host
 * (e.g. for Capacitor Android APK or remote web deployments)
 * while defaulting to relative '/api' for local Vite dev / preview / Electron.
 */

export const getApiBaseUrl = () => {
  try {
    const envUrl = import.meta.env?.VITE_API_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
      return envUrl.trim().replace(/\/+$/, '');
    }
  } catch (e) {
    // In environments without import.meta.env
  }
  return '';
};

export const apiUrl = (endpoint) => {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
};
