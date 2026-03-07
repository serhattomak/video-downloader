import { HistoryItem } from '../types'

interface HistoryProps {
  history: HistoryItem[]
  onRemove: (id: string) => void
  onClearAll: () => void
  onAddToQueue: (item: HistoryItem) => void
  onToggleFavorite: (item: HistoryItem) => void
  onOpenFolder: (path: string) => void
  isFavorite: (url: string) => boolean
}

export default function History({
  history,
  onRemove,
  onClearAll,
  onAddToQueue,
  onToggleFavorite,
  onOpenFolder,
  isFavorite
}: HistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h2 className="swiss-type-h2" style={{ margin: 0 }}>Download History</h2>
          <p className="swiss-type-caption" style={{ color: '#9CA3AF', marginTop: '4px' }}>
            {history.length} downloaded videos
          </p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={onClearAll}
            style={{
              padding: '8px 14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '0.875rem',
              color: '#6B7280',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px dashed #E5E7EB'
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            margin: '0 auto 16px',
            backgroundColor: '#F3F4F6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="swiss-type-small" style={{ color: '#6B7280', marginBottom: '8px' }}>
            No history yet
          </h3>
          <p className="swiss-type-caption" style={{ color: '#9CA3AF' }}>
            Downloaded videos will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.map((item) => (
            <div
              key={item.id}
              className="swiss-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '10px'
              }}
            >
              {/* Thumbnail */}
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  style={{
                    width: '80px',
                    height: '50px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    flexShrink: 0
                  }}
                />
              ) : (
                <div style={{
                  width: '80px',
                  height: '50px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '6px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="swiss-type-small" style={{ 
                  margin: 0, 
                  fontWeight: '500',
                  color: '#1F2937',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.title}
                </h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span className="swiss-type-caption" style={{ color: '#9CA3AF' }}>
                    {item.platform}
                  </span>
                  <span style={{ color: '#D1D5DB' }}>•</span>
                  <span className="swiss-type-caption" style={{ color: '#9CA3AF' }}>
                    {item.format}
                  </span>
                  <span style={{ color: '#D1D5DB' }}>•</span>
                  <span className="swiss-type-caption" style={{ color: '#9CA3AF' }}>
                    {formatDate(item.downloadedAt)}
                  </span>
                  {item.fileSize && (
                    <>
                      <span style={{ color: '#D1D5DB' }}>•</span>
                      <span className="swiss-type-caption" style={{ color: '#9CA3AF' }}>
                        {formatFileSize(item.fileSize)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Completed Badge */}
              <div style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '500',
                backgroundColor: '#D1FAE5',
                color: '#059669',
                flexShrink: 0
              }}>
                Downloaded
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {/* Open Folder */}
                <button
                  onClick={() => onOpenFolder(item.filePath)}
                  title="Open folder"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </button>

                {/* Add to Queue */}
                <button
                  onClick={() => onAddToQueue(item)}
                  title="Download again"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>

                {/* Favorite Toggle */}
                <button
                  onClick={() => onToggleFavorite(item)}
                  title={isFavorite(item.url) ? 'Remove from favorites' : 'Add to favorites'}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: isFavorite(item.url) ? '#FEF3C7' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorite(item.url) ? '#F59E0B' : 'none'} stroke={isFavorite(item.url) ? '#F59E0B' : '#6B7280'} strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>

                {/* Remove */}
                <button
                  onClick={() => onRemove(item.id)}
                  title="Remove from history"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
