"use strict";
const electron = require("electron");
const electronAPI = {
  // yt-dlp
  checkYtDlp: () => electron.ipcRenderer.invoke("check-yt-dlp"),
  installYtDlp: () => electron.ipcRenderer.invoke("install-yt-dlp"),
  getVideoInfo: (url) => electron.ipcRenderer.invoke("get-video-info", url),
  getFormats: (url) => electron.ipcRenderer.invoke("get-formats", url),
  downloadVideo: (options) => electron.ipcRenderer.invoke("download-video", options),
  // File system
  getDownloadPath: () => electron.ipcRenderer.invoke("get-download-path"),
  selectDirectory: () => electron.ipcRenderer.invoke("select-directory"),
  openFolder: (path) => electron.ipcRenderer.invoke("open-folder", path),
  getFileSize: (path) => electron.ipcRenderer.invoke("get-file-size", path),
  // Queue
  downloadFromQueue: (item) => electron.ipcRenderer.invoke("download-from-queue", item),
  // History
  addToHistory: (item) => electron.ipcRenderer.invoke("add-to-history", item),
  getHistory: () => electron.ipcRenderer.invoke("get-history"),
  clearHistory: () => electron.ipcRenderer.invoke("clear-history"),
  removeFromHistory: (id) => electron.ipcRenderer.invoke("remove-from-history", id),
  // Favorites
  addToFavorites: (item) => electron.ipcRenderer.invoke("add-to-favorites", item),
  getFavorites: () => electron.ipcRenderer.invoke("get-favorites"),
  removeFromFavorites: (id) => electron.ipcRenderer.invoke("remove-from-favorites", id),
  isFavorite: (url) => electron.ipcRenderer.invoke("is-favorite", url),
  // Events
  onDownloadProgress: (callback) => {
    const listener = (_, data) => callback(data);
    electron.ipcRenderer.on("download-progress", listener);
    return () => electron.ipcRenderer.removeListener("download-progress", listener);
  },
  onDownloadComplete: (callback) => {
    const listener = (_, message) => callback(message);
    electron.ipcRenderer.on("download-complete", listener);
    return () => electron.ipcRenderer.removeListener("download-complete", listener);
  },
  onQueueProgress: (callback) => {
    const listener = (_, data) => callback(data);
    electron.ipcRenderer.on("queue-progress", listener);
    return () => electron.ipcRenderer.removeListener("queue-progress", listener);
  },
  onQueueItemComplete: (callback) => {
    const listener = (_, data) => callback(data);
    electron.ipcRenderer.on("queue-item-complete", listener);
    return () => electron.ipcRenderer.removeListener("queue-item-complete", listener);
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
