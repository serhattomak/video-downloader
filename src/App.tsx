import { useState, useEffect } from 'react'
import Header from './components/Header'
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
      
      // Check if it's X (Twitter) - X may not return formats properly
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
    <div className="min-h-screen bg-dark-900 text-dark-100 pb-16">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* yt-dlp Installation Check */}
        {ytDlpInstalled === false && (
          <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-400">yt-dlp Required</h3>
                <p className="text-sm text-dark-400">This app requires yt-dlp to download videos.</p>
              </div>
              <button
                onClick={handleInstallYtDlp}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-dark-900 font-medium rounded-lg transition-colors"
              >
                Install yt-dlp
              </button>
            </div>
          </div>
        )}

        {/* URL Input */}
        <UrlInput
          url={url}
          onUrlChange={setUrl}
          onSubmit={handleUrlSubmit}
          isLoading={isLoading}
          ytDlpInstalled={ytDlpInstalled}
        />

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Video Info */}
        {videoData && (
          <VideoInfo video={videoData} />
        )}

        {/* Format Selector */}
        {videoData && videoData.formats && videoData.formats.length > 0 && (
          <FormatSelector
            formats={videoData.formats}
            selectedFormat={selectedFormat}
            onSelect={setSelectedFormat}
          />
        )}

        {/* Download Button */}
        {videoData && selectedFormat && (
          <DownloadButton
            onClick={handleDownload}
            isLoading={isDownloading}
            outputPath={outputPath}
            onPathChange={setOutputPath}
            onSelectDirectory={handleSelectDirectory}
          />
        )}

        {/* Progress */}
        {isDownloading && progress && (
          <Progress progress={progress} />
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 bg-dark-900/80 backdrop-blur-sm border-t border-dark-700">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-dark-500">
          Video Downloader • Supports YouTube, X, Instagram, TikTok, Facebook
        </div>
      </footer>
    </div>
  )
}

export default App
