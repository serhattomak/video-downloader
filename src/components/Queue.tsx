import { QueueItem, QueueItemStatus } from '../types'

interface QueueProps {
  queue: QueueItem[]
  onStartDownload: () => void
  onRemoveItem: (id: string) => void
  onClearAll: () => void
  onTogglePause: (id: string) => void
  parallelCount: number
  onParallelCountChange: (count: number) => void
  isDownloading: boolean
}

const statusColors: Record<QueueItemStatus, { bg: string; text: string }> = {
  pending: { bg: '#F3F4F6', text: '#6B7280' },
  downloading: { bg: '#DBEAFE', text: '#2563EB' },
  completed: { bg: '#D1FAE5', text: '#059669' },
  failed: { bg: '#FEE2E2', text: '#DC2626' },
  paused: { bg: '#FEF3C7', text: '#D97706' }
}

const statusLabels: Record<QueueItemStatus, string> = {
  pending: 'Waiting',
  downloading: 'Downloading',
  completed: 'Completed',
  failed: 'Failed',
  paused: 'Paused'
}

export default function Queue({ 
  queue, 
  onStartDownload, 
  onRemoveItem, 
  onClearAll,
  onTogglePause,
  parallelCount,
  onParallelCountChange,
  isDownloading
}: QueueProps) {
  const pendingCount = queue.filter(i => i.status === 'pending').length
  const completedCount = queue.filter(i => i.status === 'completed').length
  const failedCount = queue.filter(i => i.status === 'failed').length

  return (
    <div>
      {/* Header Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h2 className="swiss-type-h2" style={{ margin: 0 }}>Download Queue</h2>
          <p className="swiss-type-caption" style={{ color: '#9CA3AF', marginTop: '4px' }}>
            {queue.length} items • {pendingCount} waiting • {completedCount} completed • {failedCount} failed
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Parallel Downloads */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label className="swiss-type-caption" style={{ color: '#6B7280' }}>
              Parallel:
            </label>
            <select
              value={parallelCount}
              onChange={(e) => onParallelCountChange(parseInt(e.target.value))}
              disabled={isDownloading}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontSize: '0.875rem',
                color: '#374151'
              }}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
          
          {/* Clear All */}
          {queue.length > 0 && (
            <button
              onClick={onClearAll}
              disabled={isDownloading}
              style={{
                padding: '8px 14px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: '#6B7280',
                cursor: isDownloading ? 'not-allowed' : 'pointer'
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Queue Items */}
      {queue.length === 0 ? (
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
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </div>
          <h3 className="swiss-type-small" style={{ color: '#6B7280', marginBottom: '8px' }}>
            Queue is empty
          </h3>
          <p className="swiss-type-caption" style={{ color: '#9CA3AF' }}>
            Add videos to download from the Download tab
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {queue.map((item, index) => (
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
              {/* Order Number */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6B7280',
                flexShrink: 0
              }}>
                {index + 1}
              </div>

              {/* Thumbnail */}
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  style={{
                    width: '60px',
                    height: '40px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    flexShrink: 0
                  }}
                />
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <span className="swiss-type-caption" style={{ color: '#9CA3AF' }}>
                    {item.platform}
                  </span>
                  <span style={{ color: '#D1D5DB' }}>•</span>
                  <span className="swiss-type-caption" style={{ color: '#9CA3AF' }}>
                    {item.format.ext.toUpperCase()} • {item.format.resolution}
                  </span>
                  {item.trimStart || item.trimEnd ? (
                    <>
                      <span style={{ color: '#D1D5DB' }}>•</span>
                      <span className="swiss-type-caption" style={{ color: '#2563EB' }}>
                        Trim: {item.trimStart || '0:00'} - {item.trimEnd || 'End'}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Status Badge */}
              <div style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '500',
                backgroundColor: statusColors[item.status].bg,
                color: statusColors[item.status].text,
                flexShrink: 0
              }}>
                {statusLabels[item.status]}
              </div>

              {/* Progress (if downloading) */}
              {item.status === 'downloading' && item.progress !== undefined && (
                <div style={{ width: '60px', flexShrink: 0 }}>
                  <div style={{ 
                    height: '4px', 
                    backgroundColor: '#E5E7EB', 
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${item.progress}%`,
                      height: '100%',
                      backgroundColor: '#2563EB',
                      borderRadius: '2px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span className="swiss-type-caption" style={{ 
                    fontSize: '0.65rem', 
                    color: '#9CA3AF',
                    display: 'block',
                    textAlign: 'center',
                    marginTop: '2px'
                  }}>
                    {Math.round(item.progress)}%
                  </span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {(item.status === 'pending' || item.status === 'paused') && (
                  <button
                    onClick={() => onTogglePause(item.id)}
                    title={item.status === 'paused' ? 'Resume' : 'Pause'}
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
                    {item.status === 'paused' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => onRemoveItem(item.id)}
                  disabled={item.status === 'downloading'}
                  title="Remove"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    cursor: item.status === 'downloading' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: item.status === 'downloading' ? 0.5 : 1
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

      {/* Download All Button */}
      {queue.length > 0 && pendingCount > 0 && (
        <button
          onClick={onStartDownload}
          disabled={isDownloading}
          className="swiss-button swiss-button-primary"
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '14px',
            borderRadius: '10px',
            fontSize: '0.95rem'
          }}
        >
          {isDownloading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Downloading...
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Download All ({pendingCount} pending)
            </div>
          )}
        </button>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
