import { VideoFormat } from '../types'

interface FormatSelectorProps {
  formats: VideoFormat[]
  selectedFormat: string
  onSelect: (formatId: string) => void
}

export default function FormatSelector({ formats, selectedFormat, onSelect }: FormatSelectorProps) {
  // Group formats by type
  const videoFormats = formats.filter(f => f.ext === 'mp4' || f.ext === 'webm')
  const audioFormats = formats.filter(f => f.ext === 'm4a' || f.ext === 'mp3' || f.ext === 'aac' || f.ext === 'ogg')
  
  // Get best available resolution for sorting
  const getResolutionValue = (res: string) => {
    const match = res.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  // Sort video formats by resolution (highest first)
  const sortedVideoFormats = [...videoFormats].sort((a, b) => 
    getResolutionValue(b.resolution) - getResolutionValue(a.resolution)
  )

  // Get top 6 video resolutions
  const topVideoFormats = sortedVideoFormats.slice(0, 6)

  return (
    <div>
      {/* Section Label */}
      <label className="swiss-type-caption" style={{ display: 'block', marginBottom: '12px', color: '#6B7280' }}>
        Download Options
      </label>

      {/* Main Options - Three Categories */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        {/* Video + Audio (Best) */}
        <button
          onClick={() => onSelect('best')}
          style={{
            flex: 1,
            padding: '16px',
            textAlign: 'center',
            border: selectedFormat === 'best' ? '2px solid #2563EB' : '1px solid #E5E7EB',
            borderRadius: '10px',
            backgroundColor: selectedFormat === 'best' ? '#EFF6FF' : '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ marginBottom: '6px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={selectedFormat === 'best' ? '#2563EB' : '#6B7280'} strokeWidth="2" style={{ margin: '0 auto' }}>
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: selectedFormat === 'best' ? '#2563EB' : '#1F2937', marginBottom: '2px' }}>
            Video + Audio
          </div>
          <div style={{ fontSize: '0.75rem', color: selectedFormat === 'best' ? '#2563EB' : '#9CA3AF' }}>
            Best Quality (MP4)
          </div>
        </button>

        {/* Video Only */}
        <button
          onClick={() => onSelect('bestvideo')}
          style={{
            flex: 1,
            padding: '16px',
            textAlign: 'center',
            border: selectedFormat === 'bestvideo' ? '2px solid #2563EB' : '1px solid #E5E7EB',
            borderRadius: '10px',
            backgroundColor: selectedFormat === 'bestvideo' ? '#EFF6FF' : '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ marginBottom: '6px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={selectedFormat === 'bestvideo' ? '#2563EB' : '#6B7280'} strokeWidth="2" style={{ margin: '0 auto' }}>
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: selectedFormat === 'bestvideo' ? '#2563EB' : '#1F2937', marginBottom: '2px' }}>
            Video Only
          </div>
          <div style={{ fontSize: '0.75rem', color: selectedFormat === 'bestvideo' ? '#2563EB' : '#9CA3AF' }}>
            No Audio Track
          </div>
        </button>

        {/* Audio Only */}
        <button
          onClick={() => onSelect('bestaudio')}
          style={{
            flex: 1,
            padding: '16px',
            textAlign: 'center',
            border: selectedFormat === 'bestaudio' ? '2px solid #2563EB' : '1px solid #E5E7EB',
            borderRadius: '10px',
            backgroundColor: selectedFormat === 'bestaudio' ? '#EFF6FF' : '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ marginBottom: '6px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={selectedFormat === 'bestaudio' ? '#2563EB' : '#6B7280'} strokeWidth="2" style={{ margin: '0 auto' }}>
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: selectedFormat === 'bestaudio' ? '#2563EB' : '#1F2937', marginBottom: '2px' }}>
            Audio Only
          </div>
          <div style={{ fontSize: '0.75rem', color: selectedFormat === 'bestaudio' ? '#2563EB' : '#9CA3AF' }}>
            MP3 / M4A
          </div>
        </button>
      </div>

      {/* Custom Resolution Selection */}
      {selectedFormat !== 'bestaudio' && topVideoFormats.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 className="swiss-type-caption" style={{ marginBottom: '12px', color: '#9CA3AF', fontWeight: '500' }}>
            Or Select Resolution
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
            gap: '8px' 
          }}>
            {topVideoFormats.map((format) => {
              const isSelected = selectedFormat === format.format_id
              return (
                <button
                  key={format.format_id}
                  onClick={() => onSelect(format.format_id)}
                  style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: isSelected ? '2px solid #2563EB' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: isSelected ? '#2563EB' : '#1F2937' }}>
                    {format.resolution}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isSelected ? '#2563EB' : '#9CA3AF', marginTop: '2px' }}>
                    {format.ext.toUpperCase()}
                  </div>
                  {format.filesize && format.filesize !== 'Unknown' && (
                    <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '4px' }}>
                      {format.filesize}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Audio Formats - When Audio Only Selected */}
      {selectedFormat === 'bestaudio' && audioFormats.length > 0 && (
        <div>
          <h3 className="swiss-type-caption" style={{ marginBottom: '12px', color: '#9CA3AF', fontWeight: '500' }}>
            Select Audio Format
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
            gap: '8px' 
          }}>
            {audioFormats.slice(0, 4).map((format) => {
              const isSelected = selectedFormat === format.format_id
              return (
                <button
                  key={format.format_id}
                  onClick={() => onSelect(format.format_id)}
                  style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: isSelected ? '2px solid #2563EB' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: isSelected ? '#2563EB' : '#1F2937' }}>
                    {format.ext.toUpperCase()}
                  </div>
                  {format.filesize && format.filesize !== 'Unknown' && (
                    <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '4px' }}>
                      {format.filesize}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
