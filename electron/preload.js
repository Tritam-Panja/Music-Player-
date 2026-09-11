const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  onMaximizeChange: (callback) => {
    const handler = (_, val) => callback(val);
    ipcRenderer.on('window:maximize-change', handler);
    return () => ipcRenderer.removeListener('window:maximize-change', handler);
  },
  onMediaPlayPause: (callback) => ipcRenderer.on('media:play-pause', callback),
  onMediaNext: (callback) => ipcRenderer.on('media:next', callback),
  onMediaPrev: (callback) => ipcRenderer.on('media:prev', callback),
  isElectron: true,

  // Native Zero-CORS YouTube APIs
  search: (query, type) => ipcRenderer.invoke('yt:search', { query, type }),
  getSuggestions: (query) => ipcRenderer.invoke('yt:suggestions', query),
  getTrending: () => ipcRenderer.invoke('yt:trending'),

  // BitChord-style in-app Google Login window
  openLoginWindow: () => ipcRenderer.invoke('yt:open-login-window'),
});
