import { VideoFormat } from '../types'

interface FormatSelectorProps {
  formats: VideoFormat[]
  selectedFormat: string
  onSelect: (formatId: string) => void
}

export default function FormatSelector({ formats, selectedFormat, onSelect }: FormatSelectorProps) {
  // Group formats by type
  const videoFormats = formats.filter(f => f.ext === 'mp4' || f.ext === 'webm')
  const audioFormats = formats.filter(f => f.ext === 'm4a' || f.ext === 'mp3')

  return (
    <div>
      {/* Section Label */}
      <label className="swiss-type-caption" style={{ display: 'block', marginBottom: '12px', color: '#6B7280' }}>
        Select Quality
      </label>

      {/* Quick Options - Soft Toggle Style */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => onSelect('best')}
          style={{
            padding: '10px 18px',
            fontSize: '0.85rem',
            fontWeight: '500',
            border: selectedFormat === 'best' ? '1px solid #2563EB' : '1px solid #E5E7EB',
            borderRadius: '6px',
            backgroundColor: selectedFormat === 'best' ? '#2563EB' : '#FFFFFF',
            color: selectedFormat === 'best' ? '#FFFFFF' : '#4B5563',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: selectedFormat === 'best' ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none'
          }}
        >
          Best Quality (MP4)
        </button>
        <button
          onClick={() => onSelect('bestaudio')}
          style={{
            padding: '10px 18px',
            fontSize: '0.85rem',
            fontWeight: '500',
            border: selectedFormat === 'bestaudio' ? '1px solid #2563EB' : '1px solid #E5E7EB',
            borderRadius: '6px',
            backgroundColor: selectedFormat === 'bestaudio' ? '#2563EB' : '#FFFFFF',
            color: selectedFormat === 'bestaudio' ? '#FFFFFF' : '#4B5563',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: selectedFormat === 'bestaudio' ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none'
          }}
        >
          Audio Only
        </button>
      </div>

      {/* Video Formats Grid */}
      {videoFormats.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 className="swiss-type-caption" style={{ marginBottom: '10px', color: '#9CA3AF' }}>
            Video (Manual)
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
            gap: '8px' 
          }}>
            {videoFormats.slice(0, 12).map((format) => (
              <button
                key={format.format_id}
                onClick={() => onSelect(format.format_id)}
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  border: selectedFormat === format.format_id ? '1px solid #2563EB' : '1px solid #E5E7EB',
                  borderRadius: '6px',
                  backgroundColor: selectedFormat === format.format_id ? '#2563EB' : '#FFFFFF',
                  color: selectedFormat === format.format_id ? '#FFFFFF' : '#4B5563',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedFormat === format.format_id ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{format.resolution}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '600', opacity: 0.7 }}>{format.ext.toUpperCase()}</span>
                </div>
                {format.filesize && format.filesize !== 'Unknown' && (
                  <span style={{ fontSize: '0.75rem', opacity: selectedFormat === format.format_id ? 0.8 : 0.5 }}>
                    {format.filesize}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audio Formats Grid */}
      {audioFormats.length > 0 && (
        <div>
          <h3 className="swiss-type-caption" style={{ marginBottom: '10px', color: '#9CA3AF' }}>
            Audio Only (Manual)
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
            gap: '8px' 
          }}>
            {audioFormats.slice(0, 6).map((format) => (
              <button
                key={format.format_id}
                onClick={() => onSelect(format.format_id)}
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  border: selectedFormat === format.format_id ? '1px solid #2563EB' : '1px solid #E5E7EB',
                  borderRadius: '6px',
                  backgroundColor: selectedFormat === format.format_id ? '#2563EB' : '#FFFFFF',
                  color: selectedFormat === format.format_id ? '#FFFFFF' : '#4B5563',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedFormat === format.format_id ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Audio</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '600', opacity: 0.7 }}>{format.ext.toUpperCase()}</span>
                </div>
                {format.filesize && format.filesize !== 'Unknown' && (
                  <span style={{ fontSize: '0.75rem', opacity: selectedFormat === format.format_id ? 0.8 : 0.5 }}>
                    {format.filesize}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
