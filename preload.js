const { contextBridge, ipcRenderer } = require('electron');

// Expondo APIs seguras para o processo de renderização
contextBridge.exposeInMainWorld('electron', {
  // APIs de arquivo
  saveFile: async (data) => ipcRenderer.invoke('save-file', data),
  openFile: async () => ipcRenderer.invoke('open-file'),
  downloadPDF: async (data) => ipcRenderer.invoke('download-pdf', data),
  
  // APIs de notificação
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  
  // APIs de autenticação
  getAuthStatus: async () => ipcRenderer.invoke('get-auth-status'),
  
  // APIs de sistema
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Listeners
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onAuthChange: (callback) => ipcRenderer.on('auth-change', callback),
  
  // APIs de anexos locais
  attachmentsList: async (params) => ipcRenderer.invoke('attachments-list', params),
  attachmentsUpload: async (params) => ipcRenderer.invoke('attachments-upload', params),
  attachmentsDelete: async (params) => ipcRenderer.invoke('attachments-delete', params),
  attachmentsDownload: async (params) => ipcRenderer.invoke('attachments-download', params)
}); 
