import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { YouTube } from 'youtube-sr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

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
      webSecurity: false
    }
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
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow?.webContents.send('media:play-pause');
  });
  globalShortcut.register('MediaNextTrack', () => {
    mainWindow?.webContents.send('media:next');
  });
  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow?.webContents.send('media:prev');
  });

  // Native Zero-CORS YouTube Search IPC Handlers
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
      const response = await fetch(
        `https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&hl=en&gl=us&ds=yt&q=${encodeURIComponent(query)}`
      );
      const text = await response.text();
      const jsonMatch = text.match(/^[^(]*\((.*)\);?$/);
      if (jsonMatch && jsonMatch[1]) {
        const data = JSON.parse(jsonMatch[1]);
        if (Array.isArray(data[1])) {
          return data[1].map(item => item[0]).filter(Boolean);
        }
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
