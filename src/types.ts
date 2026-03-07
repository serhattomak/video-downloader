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

// ============================================
// Queue Types
// ============================================

export type QueueItemStatus = 'pending' | 'downloading' | 'completed' | 'failed' | 'paused'

export interface QueueItem {
  id: string
  url: string
  title: string
  thumbnail: string
  platform: string
  format: VideoFormat
  trimStart?: string
  trimEnd?: string
  status: QueueItemStatus
  progress?: number
  error?: string
  addedAt: string
  startedAt?: string
  completedAt?: string
  outputDir: string
}

// Queue download uses simple object with formatId
export interface QueueDownloadItem {
  url: string
  formatId: string
  outputDir: string
  trimStart?: string
  trimEnd?: string
  title?: string
}

// ============================================
// History Types
// ============================================

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

// ============================================
// Favorites Types
// ============================================

export interface FavoriteItem {
  id: string
  url: string
  title: string
  thumbnail: string
  platform: string
  addedAt: string
}

// ============================================
// Electron API Types
// ============================================

export interface ElectronAPI {
  // yt-dlp
  checkYtDlp: () => Promise<boolean>
  installYtDlp: () => Promise<string>
  getVideoInfo: (url: string) => Promise<VideoInfo>
  getFormats: (url: string) => Promise<VideoFormat[]>
  downloadVideo: (options: DownloadOptions) => Promise<string>
  
  // File system
  getDownloadPath: () => Promise<string>
  selectDirectory: () => Promise<string | null>
  openFolder: (path: string) => Promise<boolean>
  getFileSize: (path: string) => Promise<number>
  
  // Queue
  downloadFromQueue: (item: QueueDownloadItem) => Promise<string>
  
  // History
  addToHistory: (item: Omit<HistoryItem, 'id' | 'downloadedAt'>) => Promise<void>
  getHistory: () => Promise<HistoryItem[]>
  clearHistory: () => Promise<void>
  removeFromHistory: (id: string) => Promise<void>
  
  // Favorites
  addToFavorites: (item: Omit<FavoriteItem, 'id' | 'addedAt'>) => Promise<void>
  getFavorites: () => Promise<FavoriteItem[]>
  removeFromFavorites: (id: string) => Promise<void>
  isFavorite: (url: string) => Promise<boolean>
  
  // Events
  onDownloadProgress: (callback: (data: ProgressData) => void) => () => void
  onDownloadComplete: (callback: (message: string) => void) => () => void
  onQueueProgress: (callback: (data: { itemId: string; progress: number }) => void) => () => void
  onQueueItemComplete: (callback: (data: { itemId: string; success: boolean; error?: string }) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
