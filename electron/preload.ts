import { contextBridge, ipcRenderer } from 'electron'

// ============================================
// Type Definitions
// ============================================

export interface VideoFormat {
  format_id: string
  ext: string
  resolution: string
  filesize: string
  note?: string
}

export interface VideoInfo {
  title: string
  thumbnail: string
  duration: string
  uploader: string
  platform: string
  formats: VideoFormat[]
}

export interface ProgressData {
  filename: string
  percent?: number
}

export interface DownloadOptions {
  url: string
  formatId: string
  outputDir: string
  trimStart?: string
  trimEnd?: string
}

export interface QueueItem {
  url: string
  formatId: string
  outputDir: string
  trimStart?: string
  trimEnd?: string
  title?: string
}

export interface HistoryItem {
  id: string
  url: string
  title: string
  thumbnail: string
  platform: string
  format: string
  filePath: string
  fileSize?: number
  downloadedAt: string
}

export interface FavoriteItem {
  id: string
  url: string
  title: string
  thumbnail: string
  platform: string
  addedAt: string
}

// ============================================
// Electron API
// ============================================

const electronAPI = {
  // yt-dlp
  checkYtDlp: (): Promise<boolean> => ipcRenderer.invoke('check-yt-dlp'),
  installYtDlp: (): Promise<string> => ipcRenderer.invoke('install-yt-dlp'),
  getVideoInfo: (url: string): Promise<VideoInfo> => ipcRenderer.invoke('get-video-info', url),
  getFormats: (url: string): Promise<VideoFormat[]> => ipcRenderer.invoke('get-formats', url),
  downloadVideo: (options: DownloadOptions): Promise<string> => ipcRenderer.invoke('download-video', options),
  
  // File system
  getDownloadPath: (): Promise<string> => ipcRenderer.invoke('get-download-path'),
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('select-directory'),
  openFolder: (path: string): Promise<boolean> => ipcRenderer.invoke('open-folder', path),
  getFileSize: (path: string): Promise<number> => ipcRenderer.invoke('get-file-size', path),
  
  // Queue
  downloadFromQueue: (item: QueueItem): Promise<string> => ipcRenderer.invoke('download-from-queue', item),
  
  // History
  addToHistory: (item: Omit<HistoryItem, 'id' | 'downloadedAt'>): Promise<void> => 
    ipcRenderer.invoke('add-to-history', item),
  getHistory: (): Promise<HistoryItem[]> => ipcRenderer.invoke('get-history'),
  clearHistory: (): Promise<void> => ipcRenderer.invoke('clear-history'),
  removeFromHistory: (id: string): Promise<void> => ipcRenderer.invoke('remove-from-history', id),
  
  // Favorites
  addToFavorites: (item: Omit<FavoriteItem, 'id' | 'addedAt'>): Promise<void> => 
    ipcRenderer.invoke('add-to-favorites', item),
  getFavorites: (): Promise<FavoriteItem[]> => ipcRenderer.invoke('get-favorites'),
  removeFromFavorites: (id: string): Promise<void> => ipcRenderer.invoke('remove-from-favorites', id),
  isFavorite: (url: string): Promise<boolean> => ipcRenderer.invoke('is-favorite', url),
  
  // Events
  onDownloadProgress: (callback: (data: ProgressData) => void) => {
    const listener = (_: any, data: ProgressData) => callback(data)
    ipcRenderer.on('download-progress', listener)
    return () => ipcRenderer.removeListener('download-progress', listener)
  },
  
  onDownloadComplete: (callback: (message: string) => void) => {
    const listener = (_: any, message: string) => callback(message)
    ipcRenderer.on('download-complete', listener)
    return () => ipcRenderer.removeListener('download-complete', listener)
  },
  
  onQueueProgress: (callback: (data: { itemId: string; progress: number }) => void) => {
    const listener = (_: any, data: { itemId: string; progress: number }) => callback(data)
    ipcRenderer.on('queue-progress', listener)
    return () => ipcRenderer.removeListener('queue-progress', listener)
  },
  
  onQueueItemComplete: (callback: (data: { itemId: string; success: boolean; error?: string }) => void) => {
    const listener = (_: any, data: { itemId: string; success: boolean; error?: string }) => callback(data)
    ipcRenderer.on('queue-item-complete', listener)
    return () => ipcRenderer.removeListener('queue-item-complete', listener)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}
