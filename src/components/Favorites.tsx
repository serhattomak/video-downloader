import { FavoriteItem } from '../types'

interface FavoritesProps {
  favorites: FavoriteItem[]
  onRemove: (id: string) => void
  onDownload: (item: FavoriteItem) => void
  onAddToQueue: (item: FavoriteItem) => void
}

export default function Favorites({
  favorites,
  onRemove,
  onDownload,
  onAddToQueue
}: FavoritesProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 className="swiss-type-h2" style={{ margin: 0 }}>Favorites</h2>
        <p className="swiss-type-caption" style={{ color: '#9CA3AF', marginTop: '4px' }}>
          {favorites.length} favorite videos
        </p>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
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
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h3 className="swiss-type-small" style={{ color: '#6B7280', marginBottom: '8px' }}>
            No favorites yet
          </h3>
          <p className="swiss-type-caption" style={{ color: '#9CA3AF' }}>
            Add videos to favorites from the Download tab or History
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {favorites.map((item) => (
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <span className="swiss-type-caption" style={{ color: '#9CA3AF' }}>
                    {item.platform}
                  </span>
                  <span style={{ color: '#D1D5DB' }}>•</span>
                  <span className="swiss-type-caption" style={{ color: '#9CA3AF' }}>
                    Added {formatDate(item.addedAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {/* Quick Download */}
                <button
                  onClick={() => onDownload(item)}
                  className="swiss-button swiss-button-soft"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </button>

                {/* Add to Queue */}
                <button
                  onClick={() => onAddToQueue(item)}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#6B7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Queue
                </button>

                {/* Remove */}
                <button
                  onClick={() => onRemove(item.id)}
                  title="Remove from favorites"
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
