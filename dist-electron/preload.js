"use strict";
const electron = require("electron");
const electronAPI = {
  checkYtDlp: () => electron.ipcRenderer.invoke("check-yt-dlp"),
  installYtDlp: () => electron.ipcRenderer.invoke("install-yt-dlp"),
  getVideoInfo: (url) => electron.ipcRenderer.invoke("get-video-info", url),
  getFormats: (url) => electron.ipcRenderer.invoke("get-formats", url),
  downloadVideo: (options) => electron.ipcRenderer.invoke("download-video", options),
  getDownloadPath: () => electron.ipcRenderer.invoke("get-download-path"),
  selectDirectory: () => electron.ipcRenderer.invoke("select-directory"),
  openFolder: (path) => electron.ipcRenderer.invoke("open-folder", path),
  onDownloadProgress: (callback) => {
    const listener = (_, data) => callback(data);
    electron.ipcRenderer.on("download-progress", listener);
    return () => electron.ipcRenderer.removeListener("download-progress", listener);
  },
  onDownloadComplete: (callback) => {
    const listener = (_, message) => callback(message);
    electron.ipcRenderer.on("download-complete", listener);
    return () => electron.ipcRenderer.removeListener("download-complete", listener);
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
