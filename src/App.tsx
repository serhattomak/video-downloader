import { useState, useEffect } from 'react'
import UrlInput from './components/UrlInput'
import VideoInfo from './components/VideoInfo'
import FormatSelector from './components/FormatSelector'
import DownloadButton from './components/DownloadButton'
import Progress from './components/Progress'
import TrimInput from './components/TrimInput'
import Queue from './components/Queue'
import History from './components/History'
import Favorites from './components/Favorites'
import TabNav from './components/TabNav'
import { 
  VideoInfo as VideoInfoType, 
  ProgressData, 
  QueueItem, 
  HistoryItem,
  FavoriteItem,
  VideoFormat 
} from './types'

type TabId = 'download' | 'queue' | 'history' | 'favorites'

function App() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('download')
  
  // Download tab state
  const [url, setUrl] = useState('')
  const [videoData, setVideoData] = useState<VideoInfoType | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat | null>(null)
  const [trimStart, setTrimStart] = useState('')
  const [trimEnd, setTrimEnd] = useState('')
  const [outputPath, setOutputPath] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ytDlpInstalled, setYtDlpInstalled] = useState<boolean | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  
  // Queue state
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [parallelCount, setParallelCount] = useState(2)
  const [isQueueDownloading, setIsQueueDownloading] = useState(false)
  
  // History state
  const [history, setHistory] = useState<HistoryItem[]>([])
  
  // Favorites state
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [favoriteUrls, setFavoriteUrls] = useState<Set<string>>(new Set())

  // Load initial data
  useEffect(() => {
    // Get default download path
    window.electronAPI.getDownloadPath().then(setOutputPath)
    
    // Check if yt-dlp is installed
    window.electronAPI.checkYtDlp().then((installed) => {
      setYtDlpInstalled(installed)
    })
    
    // Load history
    loadHistory()
    
    // Load favorites
    loadFavorites()
    
    // Listen for download progress
    const unlistenProgress = window.electronAPI.onDownloadProgress((data) => {
      setProgress(data)
    })
    
    const unlistenComplete = window.electronAPI.onDownloadComplete(() => {
      setIsDownloading(false)
      setProgress(null)
    })
    
    // Queue events
    const unlistenQueueProgress = window.electronAPI.onQueueProgress((data) => {
      setQueue(prev => prev.map(item => 
        item.id === data.itemId ? { ...item, progress: data.progress } : item
      ))
    })
    
    const unlistenQueueComplete = window.electronAPI.onQueueItemComplete((data) => {
      setQueue(prev => prev.map(item => 
        item.id === data.itemId 
          ? { 
              ...item, 
              status: data.success ? 'completed' as const : 'failed' as const,
              error: data.error 
            } 
          : item
      ))
    })
    
    return () => {
      unlistenProgress()
      unlistenComplete()
      unlistenQueueProgress()
      unlistenQueueComplete()
    }
  }, [])
  
  // Load history
  const loadHistory = async () => {
    const items = await window.electronAPI.getHistory()
    setHistory(items)
  }
  
  // Load favorites
  const loadFavorites = async () => {
    const items = await window.electronAPI.getFavorites()
    setFavorites(items)
    setFavoriteUrls(new Set(items.map(f => f.url)))
  }
  
  // Check if URL is favorite
  const checkIsFavorite = async (urlToCheck: string) => {
    const result = await window.electronAPI.isFavorite(urlToCheck)
    setIsFavorite(result)
  }

  const handleUrlSubmit = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    setError(null)
    setVideoData(null)
    setSelectedFormat(null)
    setTrimStart('')
    setTrimEnd('')

    try {
      const info = await window.electronAPI.getVideoInfo(url)
      const isX = url.toLowerCase().includes('twitter.com') || url.toLowerCase().includes('x.com')
      let formats = await window.electronAPI.getFormats(url)
      
      if (isX && (!formats || formats.length === 0)) {
        formats = [{
          format_id: 'best',
          ext: 'mp4',
          resolution: 'Best Available',
          filesize: 'Unknown',
          note: 'X/Twitter - Best quality'
        }]
      }
      
      setVideoData({ ...info, formats })
      
      if (formats && formats.length > 0) {
        // Default to best quality
        setSelectedFormat({
          format_id: 'best',
          ext: 'mp4',
          resolution: 'Best Quality',
          filesize: ''
        })
      }
      
      // Check if favorite
      checkIsFavorite(url)
    } catch (err) {
      setError(String(err))
    } finally {
      setIsLoading(false)
    }
  }
  
  // Quick download from history/favorites
  const handleQuickDownload = async (item: { url: string, title: string, thumbnail: string, platform: string }) => {
    setActiveTab('download')
    setUrl(item.url)
    
    // Wait a bit for state to update
    setTimeout(async () => {
      await handleUrlSubmit()
    }, 100)
  }
  
  // Add to queue
  const handleAddToQueue = () => {
    if (!videoData || !selectedFormat || !outputPath) return
    
    const queueItem: QueueItem = {
      id: Date.now().toString(36),
      url,
      title: videoData.title,
      thumbnail: videoData.thumbnail,
      platform: videoData.platform,
      format: selectedFormat,
      trimStart: trimStart || undefined,
      trimEnd: trimEnd || undefined,
      status: 'pending',
      addedAt: new Date().toISOString(),
      outputDir: outputPath
    }
    
    setQueue(prev => [...prev, queueItem])
    setActiveTab('queue')
    
    // Reset form
    setUrl('')
    setVideoData(null)
    setSelectedFormat(null)
    setTrimStart('')
    setTrimEnd('')
  }

  // Direct download
  const handleDownload = async () => {
    if (!url || !selectedFormat || !outputPath) return

    setIsDownloading(true)
    setProgress({ filename: 'Starting download...' })

    try {
      await window.electronAPI.downloadVideo({
        url,
        formatId: selectedFormat.format_id,
        outputDir: outputPath,
        trimStart: trimStart || undefined,
        trimEnd: trimEnd || undefined
      })
      
      // Add to history
      await window.electronAPI.addToHistory({
        url,
        title: videoData!.title,
        thumbnail: videoData!.thumbnail,
        platform: videoData!.platform,
        format: `${selectedFormat.ext.toUpperCase()} - ${selectedFormat.resolution}`,
        filePath: outputPath
      })
      loadHistory()
      
    } catch (err) {
      setError(String(err))
    } finally {
      setIsDownloading(false)
    }
  }
  
  // Queue download functions
  const handleStartQueueDownload = async () => {
    if (queue.filter(i => i.status === 'pending').length === 0) return
    
    setIsQueueDownloading(true)
    
    const pendingItems = queue.filter(i => i.status === 'pending').slice(0, parallelCount)
    
    // Start downloads in parallel
    for (const item of pendingItems) {
      setQueue(prev => prev.map(q => 
        q.id === item.id ? { ...q, status: 'downloading' as const } : q
      ))
      
      try {
        await window.electronAPI.downloadFromQueue({
          url: item.url,
          formatId: item.format.format_id,
          outputDir: item.outputDir,
          trimStart: item.trimStart,
          trimEnd: item.trimEnd
        })
        
        // Add to history
        await window.electronAPI.addToHistory({
          url: item.url,
          title: item.title,
          thumbnail: item.thumbnail,
          platform: item.platform,
          format: `${item.format.ext.toUpperCase()} - ${item.format.resolution}`,
          filePath: item.outputDir
        })
        loadHistory()
        
      } catch (err) {
        setQueue(prev => prev.map(q => 
          q.id === item.id ? { ...q, status: 'failed' as const, error: String(err) } : q
        ))
      }
    }
    
    // Check if more pending items
    const stillPending = queue.filter(i => i.status === 'pending')
    if (stillPending.length > 0) {
      // Continue with next batch
      handleStartQueueDownload()
    } else {
      setIsQueueDownloading(false)
    }
  }
  
  const handleRemoveFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id))
  }
  
  const handleClearQueue = () => {
    setQueue([])
  }
  
  const handleTogglePauseQueue = (id: string) => {
    setQueue(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'paused' ? 'pending' as const : 'paused' as const }
        : item
    ))
  }
  
  // History functions
  const handleRemoveFromHistory = async (id: string) => {
    await window.electronAPI.removeFromHistory(id)
    loadHistory()
  }
  
  const handleClearHistory = async () => {
    await window.electronAPI.clearHistory()
    loadHistory()
  }
  
  const handleAddHistoryToQueue = (item: HistoryItem) => {
    // Find format from video data (we'll use best as default)
    const queueItem: QueueItem = {
      id: Date.now().toString(36),
      url: item.url,
      title: item.title,
      thumbnail: item.thumbnail,
      platform: item.platform,
      format: { format_id: 'best', ext: 'mp4', resolution: 'Best', filesize: '' },
      status: 'pending',
      addedAt: new Date().toISOString(),
      outputDir: outputPath
    }
    setQueue(prev => [...prev, queueItem])
    setActiveTab('queue')
  }
  
  const handleToggleFavoriteFromHistory = async (item: HistoryItem) => {
    if (favoriteUrls.has(item.url)) {
      const fav = favorites.find(f => f.url === item.url)
      if (fav) {
        await window.electronAPI.removeFromFavorites(fav.id)
      }
    } else {
      await window.electronAPI.addToFavorites({
        url: item.url,
        title: item.title,
        thumbnail: item.thumbnail,
        platform: item.platform
      })
    }
    loadFavorites()
  }
  
  // Favorites functions
  const handleRemoveFromFavorites = async (id: string) => {
    await window.electronAPI.removeFromFavorites(id)
    loadFavorites()
  }
  
  const handleAddFavoriteToQueue = (item: FavoriteItem) => {
    const queueItem: QueueItem = {
      id: Date.now().toString(36),
      url: item.url,
      title: item.title,
      thumbnail: item.thumbnail,
      platform: item.platform,
      format: { format_id: 'best', ext: 'mp4', resolution: 'Best', filesize: '' },
      status: 'pending',
      addedAt: new Date().toISOString(),
      outputDir: outputPath
    }
    setQueue(prev => [...prev, queueItem])
    setActiveTab('queue')
  }
  
  // Toggle favorite from download tab
  const handleToggleFavorite = async () => {
    if (!videoData) return
    
    if (favoriteUrls.has(url)) {
      const fav = favorites.find(f => f.url === url)
      if (fav) {
        await window.electronAPI.removeFromFavorites(fav.id)
      }
    } else {
      await window.electronAPI.addToFavorites({
        url,
        title: videoData.title,
        thumbnail: videoData.thumbnail,
        platform: videoData.platform
      })
    }
    loadFavorites()
    checkIsFavorite(url)
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

  // Tab definitions
  const tabs = [
    { 
      id: 'download', 
      label: 'Download',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    },
    { 
      id: 'queue', 
      label: 'Queue',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
    },
    { 
      id: 'history', 
      label: 'History',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    },
    { 
      id: 'favorites', 
      label: 'Favorites',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    }
  ]
  
  const badges = {
    queue: queue.filter(i => i.status === 'pending').length,
    history: history.length,
    favorites: favorites.length
  }

  return (
    <div className="page-background" style={{ paddingTop: '48px', paddingBottom: '80px', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ marginBottom: '32px' }}>
        <div className="swiss-container" style={{ padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                <p className="swiss-type-caption" style={{ color: '#9CA3AF', margin: 0 }}>v2.0 - Queue & More</p>
              </div>
            </div>
            
            <div style={{ 
              padding: '6px 12px', 
              backgroundColor: '#FFFFFF', 
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}>
              <span className="swiss-type-caption" style={{ color: '#6B7280' }}>v2.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="swiss-container" style={{ padding: '0 24px', marginBottom: '24px' }}>
        <TabNav 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={(id) => setActiveTab(id as TabId)}
          badges={badges}
        />
      </div>

      {/* Main Content */}
      <main className="swiss-container" style={{ padding: '0 24px' }}>
        {/* Download Tab */}
        {activeTab === 'download' && (
          <>
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
                  selectedFormat={selectedFormat?.format_id || ''}
                  onSelect={(formatId) => {
                    console.log('Format selected:', formatId)
                    // If selecting 'best', 'bestvideo', or 'bestaudio', create a virtual format
                    if (formatId === 'best') {
                      setSelectedFormat({
                        format_id: 'best',
                        ext: 'mp4',
                        resolution: 'Best Quality',
                        filesize: ''
                      })
                    } else if (formatId === 'bestvideo') {
                      setSelectedFormat({
                        format_id: 'bestvideo',
                        ext: 'mp4',
                        resolution: 'Video Only',
                        filesize: ''
                      })
                    } else if (formatId === 'bestaudio') {
                      setSelectedFormat({
                        format_id: 'bestaudio',
                        ext: 'm4a',
                        resolution: 'Audio Only',
                        filesize: ''
                      })
                    } else if (formatId.includes('+bestaudio') || formatId.includes('+')) {
                      // Combined format - handle both format_id based and height based
                      let displayResolution = 'Custom + Audio'
                      
                      // Check if it's height-based or format ID based
                      if (formatId.includes('height=')) {
                        const heightMatch = formatId.match(/height=(\d+)/)
                        if (heightMatch) {
                          displayResolution = `${heightMatch[1]}p + Audio`
                        }
                      } else {
                        // Format ID based like "137+140" or "96+bestaudio"
                        const parts = formatId.split('+')
                        const videoFormatId = parts[0]
                        const audioFormatId = parts[1]
                        
                        // Try to find matching video format
                        const videoFormat = videoData?.formats?.find(f => f.format_id === videoFormatId)
                        if (videoFormat) {
                          displayResolution = videoFormat.resolution + ' + Audio'
                        }
                        console.log('Format ID based: video:', videoFormatId, 'audio:', audioFormatId, 'display:', displayResolution)
                      }
                      
                      setSelectedFormat({
                        format_id: formatId,
                        ext: 'mp4',
                        resolution: displayResolution,
                        filesize: ''
                      })
                    } else {
                      const format = videoData.formats.find(f => f.format_id === formatId)
                      console.log('Single format selected:', format)
                      if (format) setSelectedFormat(format)
                    }
                  }}
                />
              </div>
            )}
            
            {/* Trim Input */}
            {videoData && videoData.duration !== 'Unknown' && (
              <div style={{ marginBottom: '24px' }}>
                <TrimInput
                  duration={videoData.duration}
                  trimStart={trimStart}
                  trimEnd={trimEnd}
                  onTrimStartChange={setTrimStart}
                  onTrimEndChange={setTrimEnd}
                />
              </div>
            )}

            {/* Download Button */}
            {videoData && selectedFormat && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <DownloadButton
                      onClick={handleDownload}
                      isLoading={isDownloading}
                      outputPath={outputPath}
                      onPathChange={setOutputPath}
                      onSelectDirectory={handleSelectDirectory}
                    />
                  </div>
                  
                  {/* Add to Queue Button */}
                  <button
                    onClick={handleAddToQueue}
                    className="swiss-button"
                    style={{ 
                      padding: '14px 24px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      color: '#374151',
                      borderRadius: '8px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add to Queue
                  </button>
                  
                  {/* Favorite Button */}
                  <button
                    onClick={handleToggleFavorite}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: isFavorite ? '#FEF3C7' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? '#F59E0B' : 'none'} stroke={isFavorite ? '#F59E0B' : '#6B7280'} strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Progress */}
            {isDownloading && progress && (
              <div style={{ marginBottom: '24px' }}>
                <Progress progress={progress} />
              </div>
            )}
          </>
        )}
        
        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <Queue
            queue={queue}
            onStartDownload={handleStartQueueDownload}
            onRemoveItem={handleRemoveFromQueue}
            onClearAll={handleClearQueue}
            onTogglePause={handleTogglePauseQueue}
            parallelCount={parallelCount}
            onParallelCountChange={setParallelCount}
            isDownloading={isQueueDownloading}
          />
        )}
        
        {/* History Tab */}
        {activeTab === 'history' && (
          <History
            history={history}
            onRemove={handleRemoveFromHistory}
            onClearAll={handleClearHistory}
            onAddToQueue={handleAddHistoryToQueue}
            onToggleFavorite={handleToggleFavoriteFromHistory}
            onOpenFolder={(path) => window.electronAPI.openFolder(path)}
            isFavorite={(url) => favoriteUrls.has(url)}
          />
        )}
        
        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <Favorites
            favorites={favorites}
            onRemove={handleRemoveFromFavorites}
            onDownload={handleQuickDownload}
            onAddToQueue={handleAddFavoriteToQueue}
          />
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
              v2.0 • Built with Electron
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
