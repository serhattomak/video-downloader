import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import { spawn, execSync } from 'child_process'
import log from 'electron-log'

// Configure logging
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

// Check if running in production
const isDev = process.env.NODE_ENV === 'development' || 
              (!app.isPackaged && !process.execPath.includes('release'))

// Get the correct base path for resources
function getBasePath() {
  if (isDev) {
    return process.cwd()
  }
  // In production, the app.asar is in resources folder
  return path.join(__dirname, '..')
}

// Get resources path
function getResourcesPath() {
  if (isDev) {
    return path.join(process.cwd(), 'resources')
  }
  return path.join(getBasePath(), 'resources')
}

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

// Get yt-dlp path
function getYtDlpPath(): string {
  // Check for bundled yt-dlp in app directory
  const appDir = isDev 
    ? path.join(process.cwd(), 'resources')
    : path.join(__dirname, '..')
  
  const bundledPath = path.join(appDir, 'yt-dlp.exe')
  if (fs.existsSync(bundledPath)) {
    log.info('Using bundled yt-dlp:', bundledPath)
    return bundledPath
  }
  
  // Fallback to system PATH
  return 'yt-dlp'
}

// Check if yt-dlp is installed
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

// Install yt-dlp
ipcMain.handle('install-yt-dlp', async () => {
  return new Promise((resolve, reject) => {
    // Try pip install first
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
        // Try winget as fallback
        log.info('pip install failed, trying winget...')
        const wingetProc = spawn('winget', ['install', 'yt-dlp.yt-dlp', '-e', '--source', 'winget'], { shell: true })
        
        wingetProc.on('close', (wingetCode) => {
          if (wingetCode === 0) {
            resolve('yt-dlp installed via winget')
          } else {
            // Manual download as last resort
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

// Get video info
ipcMain.handle('get-video-info', async (_, url: string) => {
  return new Promise((resolve, reject) => {
    const ytDlpPath = getYtDlpPath()
    const args = ['--dump-json', '--no-download', '--no-check-certificate', url]
    
    // Add path if using bundled exe
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

// Get available formats
ipcMain.handle('get-formats', async (_, url: string) => {
  return new Promise((resolve) => {
    const ytDlpPath = getYtDlpPath()
    const args = ['-F', '--no-check-certificate', url]
    
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
          if (line.length > 40 && /^\d/.test(line)) {
            const formatMatch = line.match(/^(\d+)/)
            if (!formatMatch) continue
            
            const formatId = formatMatch[1]
            const extMatch = line.match(/\s(mp4|webm|m4a|mp3|aac|ogg)\s/i)
            const ext = extMatch ? extMatch[1].toLowerCase() : 'unknown'
            
            const resMatch = line.match(/(\d+x\d+|\d+p)/i)
            const resolution = resMatch ? resMatch[1] : (ext === 'm4a' || ext === 'mp3' ? 'Audio' : 'Unknown')
            
            const sizeMatch = line.match(/(\d+\.?\d*\s*[KMGT]iB?)/i)
            const filesize = sizeMatch ? sizeMatch[1] : 'Unknown'
            
            const noteMatch = line.match(/\[(.*?)\]/)
            const note = noteMatch ? noteMatch[1] : ''
            
            if (['mp4', 'webm', 'm4a', 'mp3', 'aac', 'ogg'].includes(ext)) {
              formats.push({
                format_id: formatId,
                ext,
                resolution,
                filesize,
                note
              })
            }
          }
        }
        
        resolve(formats.slice(0, 25))
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

// Download video
ipcMain.handle('download-video', async (_, options: { url: string, formatId: string, outputDir: string }) => {
  const { url, formatId, outputDir } = options
  
  const isX = url.toLowerCase().includes('twitter.com') || url.toLowerCase().includes('x.com')
  
  return new Promise((resolve, reject) => {
    const ytDlpPath = getYtDlpPath()
    let args: string[]
    
    if (formatId === 'best' || formatId === 'bestvideo') {
      if (isX) {
        args = [
          '-f', 'bestvideo+bestaudio/best',
          '--no-check-certificate',
          '-o', path.join(outputDir, '%(title)s.%(ext)s'),
          '--newline',
          '--progress',
          '--merge-output-format', 'mp4',
          url
        ]
      } else {
        args = [
          '-f', 'best',
          '--no-check-certificate',
          '-o', path.join(outputDir, '%(title)s.%(ext)s'),
          '--newline',
          '--progress',
          url
        ]
      }
    } else if (formatId === 'bestaudio') {
      args = [
        '-f', 'bestaudio',
        '--no-check-certificate',
        '-o', path.join(outputDir, '%(title)s.%(ext)s'),
        '--newline',
        '--progress',
        url
      ]
    } else {
      args = [
        '-f', formatId,
        '--no-check-certificate',
        '-o', path.join(outputDir, '%(title)s.%(ext)s'),
        '--newline',
        '--progress',
        url
      ]
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

// Get default download path
ipcMain.handle('get-download-path', async () => {
  const downloadsPath = app.getPath('downloads')
  log.info('Downloads path:', downloadsPath)
  return downloadsPath
})

// Select directory
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory']
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

// Open folder in file explorer
ipcMain.handle('open-folder', async (_, folderPath: string) => {
  try {
    shell.openPath(folderPath)
    return true
  } catch (err) {
    log.error('Error opening folder:', err)
    return false
  }
})
