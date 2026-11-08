const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  chatWithLLM: (payload) => ipcRenderer.invoke('llm-chat', payload),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
});
