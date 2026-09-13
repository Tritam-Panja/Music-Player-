import { app, BrowserWindow, ipcMain, globalShortcut, session } from 'electron';
import path from 'path';
import http from 'http';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { YouTube } from 'youtube-sr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let loginWindow = null;

// Configure Chromium flags for seamless audio streaming & zero-gesture autoplay
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      backgroundThrottling: false
    }
  });



let localServer = null;

function startLocalServer() {
  return new Promise((resolve) => {
    const distDir = path.join(__dirname, '../dist');
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4'
    };

    localServer = http.createServer((req, res) => {
      let reqPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(distDir, reqPath === '/' ? 'index.html' : reqPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading file');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });

    localServer.listen(0, '127.0.0.1', () => {
      resolve(localServer.address().port);
    });
  });
}

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    startLocalServer().then((port) => {
      mainWindow.loadURL(`http://127.0.0.1:${port}`);
    });
  }

  // Window Controls
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window:close', () => mainWindow?.close());
  ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false);

  mainWindow.on('maximize', () => mainWindow?.webContents.send('window:maximize-change', true));
  mainWindow.on('unmaximize', () => mainWindow?.webContents.send('window:maximize-change', false));

  // Global Media Shortcuts
  globalShortcut.register('MediaPlayPause', () => mainWindow?.webContents.send('media:play-pause'));
  globalShortcut.register('MediaNextTrack', () => mainWindow?.webContents.send('media:next'));
  globalShortcut.register('MediaPreviousTrack', () => mainWindow?.webContents.send('media:prev'));
  globalShortcut.register('F12', () => mainWindow?.webContents.toggleDevTools());
  globalShortcut.register('CommandOrControl+Shift+I', () => mainWindow?.webContents.toggleDevTools());

  // 1. Google OAuth2 Authorization Code + PKCE Flow for Desktop
  ipcMain.handle('yt:open-login-window', () => {
    return new Promise((resolve) => {
      if (loginWindow) {
        loginWindow.focus();
        return;
      }

      // Step 1: Generate a code_verifier and code_challenge (S256) using Node's crypto module
      const codeVerifier = crypto.randomBytes(32).toString('base64url');
      const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

      const OAUTH_PORT = 53261;
      const redirectUri = `http://localhost:${OAUTH_PORT}/oauth2callback`;
      const clientId = process.env.DESKTOP_OAUTH_CLIENT_ID || '197608102093-8b8cfiun129m17h96l35v6f3o7q6fcol.apps.googleusercontent.com';
      const scope = 'openid email profile https://www.googleapis.com/auth/youtube.readonly';

      // Step 2: Formulate authUrl for https://accounts.google.com/o/oauth2/v2/auth
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', scope);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      let isResolved = false;
      let oauthServer = null;

      const cleanup = () => {
        if (oauthServer) {
          try {
            oauthServer.close();
          } catch {}
          oauthServer = null;
        }
      };

      // Step 3: Local HTTP server to catch GET request to /oauth2callback and extract code
      oauthServer = http.createServer(async (req, res) => {
        try {
          const reqUrl = new URL(req.url, `http://localhost:${OAUTH_PORT}`);
          if (reqUrl.pathname === '/oauth2callback') {
            const code = reqUrl.searchParams.get('code');
            const error = reqUrl.searchParams.get('error');

            if (error) {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end('<html><body style="font-family:sans-serif;text-align:center;padding-top:40px;background:#18181b;color:#f87171;"><h2>Sign-in failed</h2><p>' + error + '</p></body></html>');

              if (!isResolved) {
                isResolved = true;
                if (loginWindow) {
                  loginWindow.close();
                  loginWindow = null;
                }
                cleanup();
                resolve({ success: false, error });
              }
              return;
            }

            if (code) {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end('<html><body style="font-family:sans-serif;text-align:center;padding-top:40px;background:#18181b;color:#4ade80;"><h2>Sign-in successful!</h2><p>You can close this window and return to Liquid Music.</p></body></html>');

              // Step 4: POST that code plus code_verifier to https://oauth2.googleapis.com/token
              try {
                const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  body: new URLSearchParams({
                    client_id: clientId,
                    code: code,
                    code_verifier: codeVerifier,
                    grant_type: 'authorization_code',
                    redirect_uri: redirectUri
                  }).toString()
                });

                const tokenData = await tokenRes.json();

                if (!isResolved) {
                  isResolved = true;
                  // Step 5: Close loginWindow and resolve promise with { success: true, accessToken }
                  if (loginWindow) {
                    loginWindow.close();
                    loginWindow = null;
                  }
                  cleanup();

                  if (tokenData.access_token) {
                    resolve({
                      success: true,
                      accessToken: tokenData.access_token
                    });
                  } else {
                    resolve({
                      success: false,
                      error: tokenData.error_description || tokenData.error || 'Failed to exchange authorization code for access token.'
                    });
                  }
                }
              } catch (tokenErr) {
                if (!isResolved) {
                  isResolved = true;
                  if (loginWindow) {
                    loginWindow.close();
                    loginWindow = null;
                  }
                  cleanup();
                  resolve({ success: false, error: tokenErr.message });
                }
              }
            }
          }
        } catch (err) {
          console.error('Error handling OAuth callback:', err);
        }
      });

      oauthServer.listen(OAUTH_PORT, '127.0.0.1', () => {
        // Step 2: Open loginWindow to Google OAuth endpoint
        loginWindow = new BrowserWindow({
          width: 520,
          height: 680,
          parent: mainWindow,
          modal: true,
          title: 'Sign In to Google',
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
          }
        });

        loginWindow.loadURL(authUrl.toString());

        loginWindow.on('closed', () => {
          loginWindow = null;
          cleanup();
          if (!isResolved) {
            isResolved = true;
            resolve({ success: false, error: 'Sign in window was closed before completion.' });
          }
        });
      });

      oauthServer.on('error', (err) => {
        console.error('OAuth callback server error:', err);
        cleanup();
        if (!isResolved) {
          isResolved = true;
          if (loginWindow) {
            loginWindow.close();
            loginWindow = null;
          }
          resolve({ success: false, error: `Failed to start local OAuth listener: ${err.message}` });
        }
      });
    });
  });

  // 2. Native Innertube Search & Suggestions IPC Handlers (BitChord style)
  ipcMain.handle('yt:search', async (_, { query, type = 'video' }) => {
    try {
      const results = await YouTube.search(query, {
        limit: 25,
        type: type === 'playlist' ? 'playlist' : 'video'
      });

      if (Array.isArray(results) && results.length > 0) {
        return {
          success: true,
          results: results.map(item => ({
            id: item.id,
            type: item.type || (item.videos ? 'playlist' : 'video'),
            title: item.title,
            artist: item.channel?.name || 'Unknown Artist',
            duration: item.duration ? Math.floor(item.duration / 1000) : 0,
            thumbnail: item.thumbnail?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
            views: item.views || 0,
            uploaded: item.uploadedAt || ''
          }))
        };
      }
    } catch (err) {
      // Fallback to direct Innertube web API if youtube-sr encounters parsing errors
    }

    try {
      const response = await fetch('https://www.youtube.com/youtubei/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          context: { client: { clientName: 'WEB', clientVersion: '2.20240101.00.00' } },
          query
        })
      });

      if (response.ok) {
        const data = await response.json();
        const sections = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
        const tracks = [];

        for (const section of sections) {
          const items = section.itemSectionRenderer?.contents || [];
          for (const item of items) {
            const vr = item.videoRenderer;
            if (vr && vr.videoId && vr.title?.runs?.[0]?.text) {
              const thumb = vr.thumbnail?.thumbnails?.[vr.thumbnail.thumbnails.length - 1]?.url;
              tracks.push({
                id: vr.videoId,
                type: 'video',
                title: vr.title.runs[0].text,
                artist: vr.ownerText?.runs?.[0]?.text || 'Unknown Artist',
                duration: 210,
                thumbnail: thumb || `https://i.ytimg.com/vi/${vr.videoId}/hqdefault.jpg`,
                views: 0,
                uploaded: vr.publishedTimeText?.simpleText || ''
              });
            }
          }
        }

        return { success: true, results: tracks };
      }
    } catch (fallbackErr) {
      return { success: false, error: fallbackErr.message, results: [] };
    }

    return { success: true, results: [] };
  });

  ipcMain.handle('yt:suggestions', async (_, query) => {
    if (!query) return [];
    try {
      const res = await fetch('https://music.youtube.com/youtubei/v1/music/get_search_suggestions', {
        method: 'POST',
        headers: WEB_REMIX_HEADERS,
        body: JSON.stringify({
          context: { client: { clientName: 'WEB_REMIX', clientVersion: '1.20250101.01.00', hl: 'en', gl: 'US' } },
          input: query
        })
      });

      if (res.ok) {
        const data = await res.json();
        const contents = data.contents?.[0]?.searchSuggestionsSectionRenderer?.contents || [];
        return contents.map(c => c.searchSuggestionRenderer?.suggestion?.runs?.map(r => r.text).join('')).filter(Boolean);
      }
      return [];
    } catch {
      return [];
    }
  });

  ipcMain.handle('yt:trending', async () => {
    try {
      const results = await YouTube.search('Top Global Hits 2026', { limit: 20, type: 'video' });
      return {
        success: true,
        results: results.map(item => ({
          id: item.id,
          type: 'video',
          title: item.title,
          artist: item.channel?.name || 'Top Artist',
          duration: item.duration ? Math.floor(item.duration / 1000) : 0,
          thumbnail: item.thumbnail?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
          views: item.views || 0,
          uploaded: item.uploadedAt || ''
        }))
      };
    } catch (err) {
      return { success: false, error: err.message, results: [] };
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  try {
    localServer?.close();
  } catch {}
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
