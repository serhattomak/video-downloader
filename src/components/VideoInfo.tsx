import type { VideoInfo } from '../types'

interface VideoInfoProps {
  video: VideoInfo
}

export default function VideoInfo({ video }: VideoInfoProps) {
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'YouTube':
        return { bg: '#FF0000', text: '#FFFFFF' }
      case 'X (Twitter)':
        return { bg: '#000000', text: '#FFFFFF' }
      case 'Instagram':
        return { bg: '#E4405F', text: '#FFFFFF' }
      case 'TikTok':
        return { bg: '#000000', text: '#FFFFFF' }
      case 'Facebook':
        return { bg: '#1877F2', text: '#FFFFFF' }
      default:
        return { bg: '#E5E7EB', text: '#1F2937' }
    }
  }

  const platformStyle = getPlatformColor(video.platform)

  return (
    <div className="swiss-card" style={{ padding: '18px', boxShadow: '0 1px 5px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', gap: '18px' }}>
        {/* Thumbnail */}
        <div style={{ flexShrink: 0 }}>
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              style={{ 
                width: '160px', 
                height: '90px', 
                objectFit: 'cover',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          ) : (
            <div style={{ 
              width: '160px', 
              height: '90px', 
              backgroundColor: '#F5F5F5', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Platform & Duration */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              padding: '4px 8px',
              fontSize: '0.7rem',
              fontWeight: '600',
              color: platformStyle.text,
              backgroundColor: platformStyle.bg,
              borderRadius: '4px',
              letterSpacing: '0.02em'
            }}>
              {video.platform}
            </span>
            <span className="swiss-type-caption" style={{ color: '#9CA3AF' }}>
              {video.duration}
            </span>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#1F2937',
            lineHeight: '1.45',
            marginBottom: '4px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {video.title}
          </h2>

          {/* Uploader */}
          <p className="swiss-type-small" style={{ color: '#6B7280', margin: 0 }}>
            {video.uploader}
          </p>
        </div>
      </div>
    </div>
  )
}
