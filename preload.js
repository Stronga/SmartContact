// preload.js
const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld(
  'electronAPI', {
    sendUpdateContact: (contactData) => ipcRenderer.send('updateContact', contactData),
    onContactUpdated: (callback) => ipcRenderer.on('contactUpdated', callback),
    removeContactUpdatedListener: () => ipcRenderer.removeAllListeners('contactUpdated'),
    openExternal: (url) => shell.openExternal(url),

  }
  
);
console.log('Preload script is running');
