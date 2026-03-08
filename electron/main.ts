import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import log from 'electron-log'
import Store from 'electron-store'

// ============================================
// Configure logging
// ============================================
log.transports.file.level = 'info'
log.transports.console.level = 'debug'

// Global exception handler
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error)
  app.exit(1)
})

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection:', reason)
})

// ============================================
// Store for History and Favorites
// ============================================
interface HistoryItem {
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

interface FavoriteItem {
  id: string
  url: string
  title: string
  thumbnail: string
  platform: string
  addedAt: string
}

interface StoreSchema {
  history: HistoryItem[]
  favorites: FavoriteItem[]
}

const store = new Store<StoreSchema>({
  defaults: {
    history: [],
    favorites: []
  }
})

// ============================================
// Helper Functions
// ============================================

// Check if running in production
const isDev = process.env.NODE_ENV === 'development' || 
              (!app.isPackaged && !process.execPath.includes('release'))

function getBasePath() {
  if (isDev) {
    return process.cwd()
  }
  return path.join(__dirname, '..')
}

function getResourcesPath() {
  if (isDev) {
    return path.join(process.cwd(), 'resources')
  }
  return path.join(getBasePath(), 'resources')
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// ============================================
// Window Management
// ============================================

let mainWindow: BrowserWindow | null = null

function createWindow() {
  const basePath = getBasePath()
  log.info('Base path:', basePath)
  log.info('Is dev:', isDev)
  
  const preloadPath = path.join(__dirname, 'preload.js')
  log.info('Preload path:', preloadPath)
  
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    minWidth: 700,
    minHeight: 550,
    title: 'Video Downloader',
    backgroundColor: '#FAFAFA',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    log.info('Window shown')
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    const distPath = path.join(__dirname, '..', 'dist', 'index.html')
    log.info('Loading production HTML from:', distPath)
    
    mainWindow.loadFile(distPath).then(() => {
      log.info('HTML loaded successfully')
    }).catch((err) => {
      log.error('Failed to load file:', err)
    })
    
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      log.error('Failed to load:', errorCode, errorDescription)
    })
    
    mainWindow.webContents.on('render-process-gone', (event, details) => {
      log.error('Renderer process gone:', details)
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  log.info('Window created')
}

app.whenReady().then(() => {
  log.info('App ready')
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ============================================
// yt-dlp Installation & Management
// ============================================

function getYtDlpPath(): string {
  const appDir = isDev 
    ? path.join(process.cwd(), 'resources')
    : path.join(__dirname, '..')
  
  const bundledPath = path.join(appDir, 'yt-dlp.exe')
  if (fs.existsSync(bundledPath)) {
    log.info('Using bundled yt-dlp:', bundledPath)
    return bundledPath
  }
  
  return 'yt-dlp'
}

function getFFmpegPath(): string {
  const appDir = isDev 
    ? path.join(process.cwd(), 'resources')
    : path.join(__dirname, '..')
  
  const bundledPath = path.join(appDir, 'ffmpeg.exe')
  if (fs.existsSync(bundledPath)) {
    log.info('Using bundled ffmpeg:', bundledPath)
    return bundledPath
  }
  
  return 'ffmpeg'
}

ipcMain.handle('check-yt-dlp', async () => {
  return new Promise((resolve) => {
    const ytDlpPath = getYtDlpPath()
    const commands = [
      { cmd: ytDlpPath, args: ['--version'] },
      { cmd: 'python', args: ['-m', 'yt_dlp', '--version'] },
      { cmd: 'python3', args: ['-m', 'yt_dlp', '--version'] }
    ]
    
    const tryCommand = (index: number) => {
      if (index >= commands.length) {
        resolve(false)
        return
      }
      
      const { cmd, args } = commands[index]
      const proc = spawn(cmd, args, { shell: true })
      
      proc.on('close', (code) => {
        if (code === 0) {
          log.info('yt-dlp found:', cmd)
          resolve(true)
        } else {
          tryCommand(index + 1)
        }
      })
      proc.on('error', () => {
        tryCommand(index + 1)
      })
    }
    
    tryCommand(0)
  })
})

ipcMain.handle('install-yt-dlp', async () => {
  return new Promise((resolve, reject) => {
    const proc = spawn('python', ['-m', 'pip', 'install', 'yt-dlp', '--upgrade', '--user'], { shell: true })
    let output = ''
    
    proc.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    proc.stderr.on('data', (data) => {
      output += data.toString()
    })
    
    proc.on('close', (code) => {
      if (code === 0) {
        log.info('yt-dlp installed via pip')
        resolve('yt-dlp installed successfully')
      } else {
        log.info('pip install failed, trying winget...')
        const wingetProc = spawn('winget', ['install', 'yt-dlp.yt-dlp', '-e', '--source', 'winget'], { shell: true })
        
        wingetProc.on('close', (wingetCode) => {
          if (wingetCode === 0) {
            resolve('yt-dlp installed via winget')
          } else {
            log.info('winget failed, trying manual download...')
            reject(new Error('Could not install yt-dlp automatically. Please install yt-dlp manually.'))
          }
        })
        
        wingetProc.on('error', () => {
          reject(new Error('Could not install yt-dlp automatically. Please install yt-dlp manually.'))
        })
      }
    })
    
    proc.on('error', (err) => {
      log.error('Error installing yt-dlp:', err)
      reject(err)
    })
  })
})

// ============================================
// Video Info & Formats
// ============================================

ipcMain.handle('get-video-info', async (_, url: string) => {
  return new Promise((resolve, reject) => {
    const ytDlpPath = getYtDlpPath()
    // Add --js-runtimes to enable JavaScript runtime for YouTube extraction
    const args = ['--dump-json', '--no-download', '--no-check-certificate', '--js-runtimes', 'node', url]
    
    const cmd = ytDlpPath.includes('yt-dlp') && !ytDlpPath.endsWith('.exe') ? 'python' : ytDlpPath
    const procArgs = ytDlpPath.includes('yt-dlp') && !ytDlpPath.endsWith('.exe') ? ['-m', 'yt_dlp', ...args] : args
    
    const proc = spawn(cmd, procArgs, { shell: true })
    let output = ''
    let errorOutput = ''

    proc.stdout.on('data', (data) => {
      output += data.toString()
    })

    proc.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    proc.on('close', (code) => {
      if (code === 0 && output) {
        try {
          const json = JSON.parse(output)
          
          const urlLower = url.toLowerCase()
          let platform = 'Unknown'
          if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
            platform = 'YouTube'
          } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
            platform = 'X (Twitter)'
          } else if (urlLower.includes('instagram.com')) {
            platform = 'Instagram'
          } else if (urlLower.includes('tiktok.com')) {
            platform = 'TikTok'
          } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) {
            platform = 'Facebook'
          }

          const title = json.title || 'Unknown'
          const thumbnail = json.thumbnail || ''
          const duration = json.duration ? 
            `${Math.floor(json.duration / 60)}:${String(json.duration % 60).padStart(2, '0')}` 
            : 'Unknown'
          const uploader = json.uploader || 'Unknown'

          resolve({
            title,
            thumbnail,
            duration,
            uploader,
            platform,
            formats: []
          })
        } catch (err) {
          reject(new Error('Failed to parse video info'))
        }
      } else {
        reject(new Error(errorOutput || 'Failed to get video info'))
      }
    })

    proc.on('error', (err) => {
      reject(err)
    })
  })
})

ipcMain.handle('get-formats', async (_, url: string) => {
  return new Promise((resolve) => {
    const ytDlpPath = getYtDlpPath()
    // Add --js-runtimes to enable JavaScript runtime for YouTube extraction
    const args = ['-F', '--no-check-certificate', '--js-runtimes', 'node', url]
    
    const cmd = ytDlpPath.includes('yt-dlp') && !ytDlpPath.endsWith('.exe') ? 'python' : ytDlpPath
    const procArgs = ytDlpPath.includes('yt-dlp') && !ytDlpPath.endsWith('.exe') ? ['-m', 'yt_dlp', ...args] : args
    
    const proc = spawn(cmd, procArgs, { shell: true })
    let output = ''

    proc.stdout.on('data', (data) => {
      output += data.toString()
    })

    proc.stderr.on('data', (data) => {
      output += data.toString()
    })

    proc.on('close', (code) => {
      if (code === 0) {
        const lines = output.split('\n')
        const formats: Array<{format_id: string, ext: string, resolution: string, filesize: string, note?: string}> = []
        
         for (const line of lines) {
           // Skip table header lines
           if (line.includes('ID') && line.includes('EXT') && line.includes('RESOLUTION')) continue
           if (line.includes('---')) continue
           
           // More flexible format ID matching (handles IDs like "137", "22", "sb0", etc.)
           const formatMatch = line.match(/^(\S+)/)
           if (!formatMatch) continue
           
           const formatId = formatMatch[1]
           
           // Skip non-video/audio formats (thumbnails, subtitles, etc.)
           if (formatId.startsWith('sb') || formatId.startsWith('ws')) continue
           
           // Try to extract extension from various patterns in yt-dlp output
           let ext = 'unknown'
           const extPatterns = [
             /\s(mp4)\s/i,
             /\s(webm)\s/i,
             /\s(m4a)\s/i,
             /\s(mp3)\s/i,
             /\s(aac)\s/i,
             /\s(ogg)\s/i,
             /\s(mov)\s/i,
             /\s(flac)\s/i,
             /\s(wav)\s/i
           ]
           
           for (const pattern of extPatterns) {
             const match = line.match(pattern)
             if (match) {
               ext = match[1].toLowerCase()
               break
             }
           }
           
           // Extract resolution - try multiple patterns
           // yt-dlp shows resolution in different places: "1920x1080", "1080p", "1080x1920" (vertical)
           let resolution = 'Unknown'
           const resPatterns = [
             /(\d{3,4}x\d{3,4})/i,      // 1920x1080, 1080x1920
             /(\d{3,4}p)/i,              // 1080p, 720p
             /(\d+k)/i                   // 4k, 8k
           ]
           
           for (const pattern of resPatterns) {
             const match = line.match(pattern)
             if (match) {
               resolution = match[1]
               break
             }
           }
           
           // Mark audio-only formats
           if (!resolution.match(/\d{3,4}/) && (ext === 'm4a' || ext === 'mp3' || ext === 'aac' || ext === 'ogg' || ext === 'flac' || ext === 'wav')) {
             resolution = 'Audio'
           }
           
           const sizeMatch = line.match(/(\d+\.?\d*\s*[KMGT]iB?)/i)
           const filesize = sizeMatch ? sizeMatch[1] : 'Unknown'
           
           const noteMatch = line.match(/\[(.*?)\]/)
           const note = noteMatch ? noteMatch[1] : ''
           
           // Include video and audio formats
           if (ext !== 'unknown' && !formatId.startsWith('sb') && !formatId.startsWith('ws')) {
             formats.push({
               format_id: formatId,
               ext,
               resolution,
               filesize,
               note
             })
           }
         }
         
         // Return all formats sorted by resolution (higher first)
         const sortedFormats = formats.sort((a, b) => {
           const getResValue = (res: string) => {
             if (res === 'Audio') return 0
             if (res === 'Unknown') return -1
             const match = res.match(/(\d+)/)
             return match ? parseInt(match[1]) : 0
           }
           return getResValue(b.resolution) - getResValue(a.resolution)
         })
         
         resolve(sortedFormats.slice(0, 50))
      } else {
        log.error('Get formats failed:', output)
        resolve([])
      }
    })

    proc.on('error', (err) => {
      log.error('Get formats error:', err)
      resolve([])
    })
  })
})

// ============================================
// Download with Trim Support
// ============================================

ipcMain.handle('download-video', async (_, options: { 
  url: string, 
  formatId: string, 
  outputDir: string,
  trimStart?: string,
  trimEnd?: string
}) => {
  const { url, formatId, outputDir, trimStart, trimEnd } = options
  
  const isX = url.toLowerCase().includes('twitter.com') || url.toLowerCase().includes('x.com')
  
  return new Promise((resolve, reject) => {
    const ytDlpPath = getYtDlpPath()
    let args: string[]
    
    // Build base args
    const baseArgs: string[] = ['--no-check-certificate', '-o', path.join(outputDir, '%(title)s.%(ext)s'), '--newline', '--progress']
    
    // Check if using trim
    const isTrimming = !!(trimStart || trimEnd)
    
    // If trimming, use single format (not combined) to avoid sync issues
    if (isTrimming) {
      if (formatId === 'best' || formatId === 'bestvideo') {
        // For trim, use best pre-muxed format
        args = [
          '-f', 'best[ext=mp4]/best[ext=webm]/best',
          ...baseArgs,
          url
        ]
      } else if (formatId === 'bestaudio') {
        args = [
          '-f', 'bestaudio',
          ...baseArgs,
          url
        ]
      } else {
        args = [
          '-f', formatId,
          ...baseArgs,
          url
        ]
      }
    } else if (formatId === 'best') {
      // Best quality with audio - use bestvideo+bestaudio for highest quality
      args = [
        '-f', 'bestvideo+bestaudio/best',
        ...baseArgs,
        url
      ]
    } else if (formatId === 'bestvideo') {
      // Video only (no audio)
      args = [
        '-f', 'bestvideo',
        ...baseArgs,
        url
      ]
    } else {
      args = [
        '-f', formatId,
        ...baseArgs,
        url
      ]
    }

    // Add ffmpeg location for video merging
    const ffmpegPath = getFFmpegPath()
    if (ffmpegPath !== 'ffmpeg') {
      args.push('--ffmpeg-location', ffmpegPath)
      log.info('Using ffmpeg at:', ffmpegPath)
    }

    // Add trim support after format selection
    if (trimStart || trimEnd) {
      const startTime = trimStart || '0'
      const endTime = trimEnd || ''
      const section = endTime ? `${startTime}-${endTime}` : startTime
      args.push('--download-sections', `*${section}`)
      log.info('Adding trim section:', section)
    }

    log.info('Starting download:', args)

    const cmd = ytDlpPath.includes('yt-dlp') && !ytDlpPath.endsWith('.exe') ? 'python' : ytDlpPath
    const procArgs = ytDlpPath.includes('yt-dlp') && !ytDlpPath.endsWith('.exe') ? ['-m', 'yt_dlp', ...args] : args
    
    const proc = spawn(cmd, procArgs, { 
      shell: true,
      env: { ...process.env, PYTHONPATH: '' } 
    })

    proc.stdout.on('data', (data) => {
      const line = data.toString().trim()
      log.info('Download:', line)
      
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('download-progress', { filename: line })
        
        if (line.includes('Merging') || line.includes('Destination:')) {
          log.info('Merging formats...')
          mainWindow.webContents.send('download-progress', { filename: 'Merging video and audio...' })
        }
        
        if (line.includes('Deleting') || line.includes('Merging') || line.includes('Fixing')) {
          mainWindow.webContents.send('download-complete', 'Download complete!')
        }
      }
    })

    proc.stderr.on('data', (data) => {
      const line = data.toString().trim()
      log.warn('Download error:', line)
    })

    proc.on('close', (code) => {
      if (code === 0) {
        log.info('Download completed successfully')
        resolve('Download completed successfully')
      } else {
        log.error('Download failed with code:', code)
        reject(new Error(`Download failed with code ${code}`))
      }
    })

    proc.on('error', (err) => {
      log.error('Download error:', err)
      reject(err)
    })
  })
})

// ============================================
// Queue Download
// ============================================

ipcMain.handle('download-from-queue', async (_, item: {
  url: string
  formatId: string
  outputDir: string
  trimStart?: string
  trimEnd?: string
}) => {
  const { url, formatId, outputDir, trimStart, trimEnd } = item
  
  const isX = url.toLowerCase().includes('twitter.com') || url.toLowerCase().includes('x.com')
  
  return new Promise((resolve, reject) => {
    const ytDlpPath = getYtDlpPath()
    let args: string[]
    
    const baseArgs: string[] = ['--no-check-certificate', '-o', path.join(outputDir, '%(title)s.%(ext)s'), '--newline', '--progress']
    
    // Check if trimming
    const isTrimming = !!(trimStart || trimEnd)
    
    // If trimming, use single format to avoid sync issues
    if (isTrimming) {
      if (formatId === 'best' || formatId === 'bestvideo') {
        args = [
          '-f', 'best[ext=mp4]/best[ext=webm]/best',
          ...baseArgs,
          url
        ]
      } else if (formatId === 'bestaudio') {
        args = ['-f', 'bestaudio', ...baseArgs, url]
      } else {
        args = ['-f', formatId, ...baseArgs, url]
      }
    } else if (formatId === 'best') {
      // Best quality with audio - use bestvideo+bestaudio for highest quality
      args = ['-f', 'bestvideo+bestaudio/best', ...baseArgs, url]
    } else if (formatId === 'bestvideo') {
      // Video only
      args = ['-f', 'bestvideo', ...baseArgs, url]
    } else if (formatId === 'bestaudio') {
      args = ['-f', 'bestaudio', ...baseArgs, url]
    } else {
      args = ['-f', formatId, ...baseArgs, url]
    }
    
    // Add ffmpeg location for video merging
    const ffmpegPath = getFFmpegPath()
    if (ffmpegPath !== 'ffmpeg') {
      args.push('--ffmpeg-location', ffmpegPath)
    }

    // Add trim after format selection
    if (trimStart || trimEnd) {
      const startTime = trimStart || '0'
      const endTime = trimEnd || ''
      const section = endTime ? `${startTime}-${endTime}` : startTime
      args.push('--download-sections', `*${section}`)
    }

    const cmd = ytDlpPath.includes('yt-dlp') && !ytDlpPath.endsWith('.exe') ? 'python' : ytDlpPath
    const procArgs = ytDlpPath.includes('yt-dlp') && !ytDlpPath.endsWith('.exe') ? ['-m', 'yt_dlp', ...args] : args
    
    const proc = spawn(cmd, procArgs, { 
      shell: true,
      env: { ...process.env, PYTHONPATH: '' } 
    })

    let finalFilePath = ''

    proc.stdout.on('data', (data) => {
      const line = data.toString().trim()
      log.info('Queue download:', line)
      
      if (mainWindow && !mainWindow.isDestroyed()) {
        // Extract filename from output
        if (line.includes('[download]') && line.includes('%')) {
          const percentMatch = line.match(/(\d+\.?\d*)%/)
          if (percentMatch) {
            mainWindow.webContents.send('queue-progress', { itemId: item.url, progress: parseFloat(percentMatch[1]) })
          }
        }
        
        mainWindow.webContents.send('download-progress', { filename: line })
        
        if (line.includes('Destination:')) {
          const destMatch = line.match(/Destination:\s*(.+)/)
          if (destMatch) {
            finalFilePath = destMatch[1].trim()
          }
        }
        
        if (line.includes('Deleting') || line.includes('Merging')) {
          mainWindow.webContents.send('download-complete', 'Download complete!')
        }
      }
    })

    proc.stderr.on('data', (data) => {
      const line = data.toString().trim()
      log.warn('Queue download error:', line)
    })

    proc.on('close', (code) => {
      if (code === 0) {
        log.info('Queue download completed')
        mainWindow?.webContents.send('queue-item-complete', { itemId: item.url, success: true })
        resolve(finalFilePath || 'Download completed')
      } else {
        log.error('Queue download failed:', code)
        mainWindow?.webContents.send('queue-item-complete', { itemId: item.url, success: false, error: `Failed with code ${code}` })
        reject(new Error(`Download failed with code ${code}`))
      }
    })

    proc.on('error', (err) => {
      log.error('Queue download error:', err)
      mainWindow?.webContents.send('queue-item-complete', { itemId: item.url, success: false, error: err.message })
      reject(err)
    })
  })
})

// ============================================
// File System
// ============================================

ipcMain.handle('get-download-path', async () => {
  const downloadsPath = app.getPath('downloads')
  log.info('Downloads path:', downloadsPath)
  return downloadsPath
})

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory']
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('open-folder', async (_, folderPath: string) => {
  try {
    shell.openPath(folderPath)
    return true
  } catch (err) {
    log.error('Error opening folder:', err)
    return false
  }
})

ipcMain.handle('get-file-size', async (_, filePath: string) => {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (err) {
    log.error('Error getting file size:', err)
    return 0
  }
})

// ============================================
// History Management
// ============================================

ipcMain.handle('add-to-history', async (_, item: Omit<HistoryItem, 'id' | 'downloadedAt'>) => {
  const history = store.get('history', [])
  const newItem: HistoryItem = {
    ...item,
    id: generateId(),
    downloadedAt: new Date().toISOString()
  }
  
  // Keep only last 100 items
  const updatedHistory = [newItem, ...history].slice(0, 100)
  store.set('history', updatedHistory)
  log.info('Added to history:', newItem.title)
})

ipcMain.handle('get-history', async () => {
  return store.get('history', [])
})

ipcMain.handle('clear-history', async () => {
  store.set('history', [])
  log.info('History cleared')
})

ipcMain.handle('remove-from-history', async (_, id: string) => {
  const history = store.get('history', [])
  const updated = history.filter(item => item.id !== id)
  store.set('history', updated)
  log.info('Removed from history:', id)
})

// ============================================
// Favorites Management
// ============================================

ipcMain.handle('add-to-favorites', async (_, item: Omit<FavoriteItem, 'id' | 'addedAt'>) => {
  const favorites = store.get('favorites', [])
  
  // Check if already exists
  if (favorites.some(f => f.url === item.url)) {
    return
  }
  
  const newItem: FavoriteItem = {
    ...item,
    id: generateId(),
    addedAt: new Date().toISOString()
  }
  
  const updated = [newItem, ...favorites]
  store.set('favorites', updated)
  log.info('Added to favorites:', newItem.title)
})

ipcMain.handle('get-favorites', async () => {
  return store.get('favorites', [])
})

ipcMain.handle('remove-from-favorites', async (_, id: string) => {
  const favorites = store.get('favorites', [])
  const updated = favorites.filter(item => item.id !== id)
  store.set('favorites', updated)
  log.info('Removed from favorites:', id)
})

ipcMain.handle('is-favorite', async (_, url: string) => {
  const favorites = store.get('favorites', [])
  return favorites.some(f => f.url === url)
})
