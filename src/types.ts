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
}

export interface DownloadOptions {
  url: string
  formatId: string
  outputDir: string
}

export interface ElectronAPI {
  checkYtDlp: () => Promise<boolean>
  installYtDlp: () => Promise<string>
  getVideoInfo: (url: string) => Promise<VideoInfo>
  getFormats: (url: string) => Promise<VideoFormat[]>
  downloadVideo: (options: DownloadOptions) => Promise<string>
  getDownloadPath: () => Promise<string>
  selectDirectory: () => Promise<string | null>
  openFolder: (path: string) => Promise<boolean>
  onDownloadProgress: (callback: (data: ProgressData) => void) => () => void
  onDownloadComplete: (callback: (message: string) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
