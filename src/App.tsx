import { useState, useEffect } from 'react'
import UrlInput from './components/UrlInput'
import VideoInfo from './components/VideoInfo'
import FormatSelector from './components/FormatSelector'
import DownloadButton from './components/DownloadButton'
import Progress from './components/Progress'
import { VideoInfo as VideoInfoType, ProgressData } from './types'

function App() {
  const [url, setUrl] = useState('')
  const [videoData, setVideoData] = useState<VideoInfoType | null>(null)
  const [selectedFormat, setSelectedFormat] = useState('')
  const [outputPath, setOutputPath] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ytDlpInstalled, setYtDlpInstalled] = useState<boolean | null>(null)

  useEffect(() => {
    // Get default download path
    window.electronAPI.getDownloadPath().then(setOutputPath)

    // Check if yt-dlp is installed
    window.electronAPI.checkYtDlp().then((installed) => {
      setYtDlpInstalled(installed)
    })

    // Listen for download progress
    const unlistenProgress = window.electronAPI.onDownloadProgress((data) => {
      setProgress(data)
    })

    const unlistenComplete = window.electronAPI.onDownloadComplete(() => {
      setIsDownloading(false)
      setProgress(null)
    })

    return () => {
      unlistenProgress()
      unlistenComplete()
    }
  }, [])

  const handleUrlSubmit = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    setError(null)
    setVideoData(null)

    try {
      // Get video info
      const info = await window.electronAPI.getVideoInfo(url)
      
      // Check if it is X (Twitter) - X may not return formats properly
      const isX = url.toLowerCase().includes('twitter.com') || url.toLowerCase().includes('x.com')
      
      // Get available formats (may be empty for X)
      let formats = await window.electronAPI.getFormats(url)
      
      // For X/Twitter, if formats is empty, add a default "best" option
      if (isX && (!formats || formats.length === 0)) {
        formats = [{
          format_id: 'best',
          ext: 'mp4',
          resolution: 'Best Available',
          filesize: 'Unknown',
          note: 'X/Twitter - Best quality'
        }]
      }
      
      setVideoData({
        ...info,
        formats
      })
      
      if (formats && formats.length > 0) {
        // Default to 'best' which will auto-select best video+audio
        setSelectedFormat('best')
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!url || !selectedFormat || !outputPath) return

    setIsDownloading(true)
    setProgress({ filename: 'Starting download...' })

    try {
      await window.electronAPI.downloadVideo({
        url,
        formatId: selectedFormat,
        outputDir: outputPath
      })
    } catch (err) {
      setError(String(err))
    } finally {
      setIsDownloading(false)
    }
  }

  const handleInstallYtDlp = async () => {
    try {
      await window.electronAPI.installYtDlp()
      setYtDlpInstalled(true)
    } catch (err) {
      setError(String(err))
    }
  }

  const handleSelectDirectory = async () => {
    const dir = await window.electronAPI.selectDirectory()
    if (dir) {
      setOutputPath(dir)
    }
  }

  return (
    <div className="page-background" style={{ paddingTop: '48px', paddingBottom: '80px', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ marginBottom: '40px' }}>
        <div className="swiss-container" style={{ padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Logo */}
              <div style={{ 
                width: '44px', 
                height: '44px', 
                backgroundColor: '#2563EB', 
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <h1 className="swiss-type-h3" style={{ margin: 0, fontWeight: '600' }}>Video Downloader</h1>
                <p className="swiss-type-caption" style={{ color: '#9CA3AF', margin: 0 }}>Swiss Design</p>
              </div>
            </div>
            
            {/* Version Badge */}
            <div style={{ 
              padding: '6px 12px', 
              backgroundColor: '#FFFFFF', 
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}>
              <span className="swiss-type-caption" style={{ color: '#6B7280' }}>v1.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="swiss-container" style={{ padding: '0 24px' }}>
        {/* yt-dlp Installation Check */}
        {ytDlpInstalled === false && (
          <div className="swiss-card" style={{ 
            marginBottom: '24px', 
            borderColor: '#FEF3C7',
            backgroundColor: '#FFFBEB',
            boxShadow: 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#FEF3C7', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 className="swiss-type-small" style={{ fontWeight: '600', color: '#92400E', marginBottom: '2px' }}>yt-dlp Required</h3>
                <p className="swiss-type-small" style={{ color: '#B45309', margin: 0 }}>This app requires yt-dlp to download videos.</p>
              </div>
              <button
                onClick={handleInstallYtDlp}
                className="swiss-button swiss-button-soft"
                style={{ padding: '10px 18px', borderRadius: '6px' }}
              >
                Install
              </button>
            </div>
          </div>
        )}

        {/* URL Input */}
        <div style={{ marginBottom: '24px' }}>
          <UrlInput
            url={url}
            onUrlChange={setUrl}
            onSubmit={handleUrlSubmit}
            isLoading={isLoading}
            ytDlpInstalled={ytDlpInstalled}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="swiss-card" style={{ marginBottom: '24px', borderColor: '#FEE2E2', backgroundColor: '#FEF2F2', boxShadow: 'none' }}>
            <p className="swiss-type-small" style={{ color: '#991B1B', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Video Info */}
        {videoData && (
          <div style={{ marginBottom: '24px' }}>
            <VideoInfo video={videoData} />
          </div>
        )}

        {/* Format Selector */}
        {videoData && videoData.formats && videoData.formats.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <FormatSelector
              formats={videoData.formats}
              selectedFormat={selectedFormat}
              onSelect={setSelectedFormat}
            />
          </div>
        )}

        {/* Download Button */}
        {videoData && selectedFormat && (
          <div style={{ marginBottom: '24px' }}>
            <DownloadButton
              onClick={handleDownload}
              isLoading={isDownloading}
              outputPath={outputPath}
              onPathChange={setOutputPath}
              onSelectDirectory={handleSelectDirectory}
            />
          </div>
        )}

        {/* Progress */}
        {isDownloading && progress && (
          <div style={{ marginBottom: '24px' }}>
            <Progress progress={progress} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: '14px 0',
        backgroundColor: 'rgba(250, 250, 250, 0.9)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid #E5E7EB'
      }}>
        <div className="swiss-container" style={{ padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="swiss-type-caption" style={{ color: '#9CA3AF', margin: 0 }}>
              Supports YouTube, X, Instagram, TikTok, Facebook
            </p>
            <p className="swiss-type-caption" style={{ color: '#9CA3AF', margin: 0 }}>
              Built with Electron
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
