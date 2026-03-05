import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'path'
import { spawn } from 'child_process'
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
// Use NODE_ENV or check if we're in the release folder
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

let mainWindow: BrowserWindow | null = null

function createWindow() {
  const basePath = getBasePath()
  log.info('Base path:', basePath)
  log.info('Is dev:', isDev)
  
  const preloadPath = path.join(__dirname, 'preload.js')
    
  log.info('Preload path:', preloadPath)
  
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 700,
    minHeight: 500,
    title: 'Video Downloader',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Disable for local file loading
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
    // In production (without asar), load from resources/app/dist
    // __dirname in production is: .../resources/app/dist-electron
    const distPath = path.join(__dirname, '..', 'dist', 'index.html')
    log.info('Loading production HTML from:', distPath)
    
    // Try to load the file and check for errors
    mainWindow.loadFile(distPath).then(() => {
      log.info('HTML loaded successfully')
    }).catch((err) => {
      log.error('Failed to load file:', err)
    })
    
    // Also log any webContents errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      log.error('Failed to load:', errorCode, errorDescription)
    })
    
    mainWindow.webContents.on('render-process-gone', (event, details) => {
      log.error('Renderer process gone:', details)
    })
    
    // Log console errors from renderer
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      log.info('Console:', message)
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

// Check if yt-dlp is installed
ipcMain.handle('check-yt-dlp', async () => {
  return new Promise((resolve) => {
    // Try different commands
    const commands = [
      { cmd: 'yt-dlp', args: ['--version'] },
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
    const proc = spawn('python', ['-m', 'pip', 'install', 'yt-dlp', '--upgrade'], { shell: true })
    let output = ''
    
    proc.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    proc.stderr.on('data', (data) => {
      output += data.toString()
    })
    
    proc.on('close', (code) => {
      if (code === 0) {
        log.info('yt-dlp installed')
        resolve('yt-dlp installed successfully')
      } else {
        log.error('Failed to install yt-dlp:', output)
        reject(new Error(output || 'Failed to install yt-dlp'))
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
    const proc = spawn('python', ['-m', 'yt_dlp', '--dump-json', '--no-download', '--no-check-certificate', url], { shell: true })
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
          
          // Detect platform
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
            formats: [] // Will be populated by format list
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
  return new Promise((resolve, reject) => {
    // Add --no-check-certificate to handle certificate issues
    const proc = spawn('python', ['-m', 'yt_dlp', '-F', '--no-check-certificate', url], { shell: true })
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
          // Parse format lines - be more flexible
          if (line.length > 40 && /^\d/.test(line)) {
            // Extract format ID (first number)
            const formatMatch = line.match(/^(\d+)/)
            if (!formatMatch) continue
            
            const formatId = formatMatch[1]
            
            // Extract extension
            const extMatch = line.match(/\s(mp4|webm|m4a|mp3|aac|ogg)\s/i)
            const ext = extMatch ? extMatch[1].toLowerCase() : 'unknown'
            
            // Extract resolution
            const resMatch = line.match(/(\d+x\d+|\d+p)/i)
            const resolution = resMatch ? resMatch[1] : (ext === 'm4a' || ext === 'mp3' ? 'Audio' : 'Unknown')
            
            // Extract filesize
            const sizeMatch = line.match(/(\d+\.?\d*\s*[KMGT]iB?)/i)
            const filesize = sizeMatch ? sizeMatch[1] : 'Unknown'
            
            // Extract note if present
            const noteMatch = line.match(/\[(.*?)\]/)
            const note = noteMatch ? noteMatch[1] : ''
            
            // Include all video/audio formats
            if (['mp4', 'webm', 'm4a', 'mp3', 'aac', 'ogg'].includes(ext)) {
              formats.push({
                format_id: formatId,
                ext,
                resolution: resolution === 'Audio' || resolution.match(/^\d+p$/) ? resolution : resolution,
                filesize,
                note
              })
            }
          }
        }
        
        resolve(formats.slice(0, 25))
      } else {
        log.error('Get formats failed:', output)
        // Return empty array instead of rejecting - we can still try to download
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
  
  // Check if it's X/Twitter URL
  const isX = url.toLowerCase().includes('twitter.com') || url.toLowerCase().includes('x.com')
  
  return new Promise((resolve, reject) => {
    // Build yt-dlp arguments based on format selection
    let args: string[]
    
    if (formatId === 'best' || formatId === 'bestvideo') {
      // Best quality - simple and reliable
      // For X/Twitter, use a more flexible format selector
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
      // Audio only
      args = [
        '-f', 'bestaudio',
        '--no-check-certificate',
        '-o', path.join(outputDir, '%(title)s.%(ext)s'),
        '--newline',
        '--progress',
        url
      ]
    } else {
      // Specific format - use as-is
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

    // Use full path to python to ensure ffmpeg is found
    const proc = spawn('python', ['-m', 'yt_dlp', ...args], { 
      shell: true,
      env: { ...process.env, PYTHONPATH: '' } 
    })

    proc.stdout.on('data', (data) => {
      const line = data.toString().trim()
      log.info('Download:', line)
      
      // Send progress to renderer
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('download-progress', { filename: line })
        
        // Check for merging
        if (line.includes('Merging') || line.includes('Destination:')) {
          log.info('Merging formats...')
          mainWindow.webContents.send('download-progress', { filename: 'Merging video and audio...' })
        }
        
        // Check for completion
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

