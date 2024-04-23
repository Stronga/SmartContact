// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'electronAPI', {
    sendUpdateContact: (contactData) => ipcRenderer.send('updateContact', contactData),
    onContactUpdated: (callback) => ipcRenderer.on('contactUpdated', callback),
    removeContactUpdatedListener: () => ipcRenderer.removeAllListeners('contactUpdated')
  }
);
