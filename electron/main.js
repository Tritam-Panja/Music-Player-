import { app, BrowserWindow, ipcMain, globalShortcut, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { YouTube } from 'youtube-sr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let loginWindow = null;

const WEB_REMIX_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  'X-YouTube-Client-Name': '67',
  'X-YouTube-Client-Version': '1.20250101.01.00'
};

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
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      autoplayPolicy: 'no-user-gesture'
    }
  });

  // Intercept headers so YouTube allows embedded playback from Electron's file:// or custom scheme
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const { url, requestHeaders } = details;
    if (url.includes('youtube.com') || url.includes('googlevideo.com') || url.includes('ytimg.com')) {
      requestHeaders['Origin'] = 'https://www.youtube.com';
      requestHeaders['Referer'] = 'https://www.youtube.com/';
      requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
    }
    callback({ requestHeaders });
  });

  // Strip restrictive framing headers from YouTube embeds
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['X-Frame-Options'];
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['Content-Security-Policy'];
    callback({ responseHeaders });
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
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

  // Global Media Shortcuts
  globalShortcut.register('MediaPlayPause', () => mainWindow?.webContents.send('media:play-pause'));
  globalShortcut.register('MediaNextTrack', () => mainWindow?.webContents.send('media:next'));
  globalShortcut.register('MediaPreviousTrack', () => mainWindow?.webContents.send('media:prev'));

  // 1. BitChord-style In-App Google Sign-In for YouTube Music
  ipcMain.handle('yt:open-login-window', () => {
    return new Promise((resolve) => {
      if (loginWindow) {
        loginWindow.focus();
        return;
      }

      loginWindow = new BrowserWindow({
        width: 520,
        height: 680,
        parent: mainWindow,
        modal: true,
        title: 'Sign In to YouTube Music',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      const loginUrl = 'https://accounts.google.com/ServiceLogin?ltmpl=music&service=youtube&passive=true&continue=https%3A%2F%2Fmusic.youtube.com%2F';
      loginWindow.loadURL(loginUrl);

      // Listen for redirect to music.youtube.com
      loginWindow.webContents.on('did-navigate', async (_, url) => {
        if (url.includes('music.youtube.com')) {
          try {
            const cookies = await session.defaultSession.cookies.get({ domain: '.youtube.com' });
            const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
            
            // Fetch user info from YouTube Music
            const accountRes = await fetch('https://music.youtube.com/youtubei/v1/account/account_menu', {
              method: 'POST',
              headers: { ...WEB_REMIX_HEADERS, 'Cookie': cookieString },
              body: JSON.stringify({
                context: { client: { clientName: 'WEB_REMIX', clientVersion: '1.20250101.01.00', hl: 'en', gl: 'US' } }
              })
            });

            let userName = 'YouTube Music User';
            let userAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

            if (accountRes.ok) {
              const accountData = await accountRes.json();
              const header = accountData?.actions?.[0]?.openPopupAction?.popup?.multiPageMenuRenderer?.header?.activeAccountHeaderRenderer;
              if (header?.accountName?.runs?.[0]?.text) {
                userName = header.accountName.runs[0].text;
              }
              if (header?.accountPhoto?.thumbnails?.[0]?.url) {
                userAvatar = header.accountPhoto.thumbnails[0].url;
              }
            }

            loginWindow.close();
            loginWindow = null;

            resolve({
              success: true,
              user: {
                name: userName,
                picture: userAvatar,
                cookie: cookieString,
                connectedAt: new Date().toISOString()
              }
            });
          } catch (err) {
            loginWindow?.close();
            loginWindow = null;
            resolve({ success: false, error: err.message });
          }
        }
      });

      loginWindow.on('closed', () => {
        loginWindow = null;
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
    } catch (err) {
      return { success: false, error: err.message, results: [] };
    }
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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
