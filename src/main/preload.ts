import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Storage API for offline mode
  store: {
    get: (key: string) => ipcRenderer.invoke('store-get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store-set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store-delete', key),
    clear: () => ipcRenderer.invoke('store-clear'),
    getAll: () => ipcRenderer.invoke('store-get-all')
  },

  // Quick capture listener
  onQuickCapture: (callback: () => void) => {
    ipcRenderer.on('quick-capture', callback);
  }
});
