import { contextBridge, ipcRenderer } from 'electron'

export interface VideoInfo {
  title: string
  thumbnail: string
  duration: string
  uploader: string
  platform: string
  formats: Array<{
    format_id: string
    ext: string
    resolution: string
    filesize: string
  }>
}

export interface DownloadOptions {
  url: string
  formatId: string
  outputDir: string
}

export interface ProgressData {
  filename: string
}

const electronAPI = {
  checkYtDlp: (): Promise<boolean> => ipcRenderer.invoke('check-yt-dlp'),
  installYtDlp: (): Promise<string> => ipcRenderer.invoke('install-yt-dlp'),
  getVideoInfo: (url: string): Promise<VideoInfo> => ipcRenderer.invoke('get-video-info', url),
  getFormats: (url: string): Promise<VideoInfo['formats']> => ipcRenderer.invoke('get-formats', url),
  downloadVideo: (options: DownloadOptions): Promise<string> => ipcRenderer.invoke('download-video', options),
  getDownloadPath: (): Promise<string> => ipcRenderer.invoke('get-download-path'),
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('select-directory'),
  openFolder: (path: string): Promise<boolean> => ipcRenderer.invoke('open-folder', path),
  
  onDownloadProgress: (callback: (data: ProgressData) => void) => {
    const listener = (_: any, data: ProgressData) => callback(data)
    ipcRenderer.on('download-progress', listener)
    return () => ipcRenderer.removeListener('download-progress', listener)
  },
  
  onDownloadComplete: (callback: (message: string) => void) => {
    const listener = (_: any, message: string) => callback(message)
    ipcRenderer.on('download-complete', listener)
    return () => ipcRenderer.removeListener('download-complete', listener)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}
