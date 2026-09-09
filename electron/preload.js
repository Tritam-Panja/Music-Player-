const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  onMediaPlayPause: (callback) => ipcRenderer.on('media:play-pause', callback),
  onMediaNext: (callback) => ipcRenderer.on('media:next', callback),
  onMediaPrev: (callback) => ipcRenderer.on('media:prev', callback),
  isElectron: true,
});
