interface TrimInputProps {
  duration: string
  trimStart: string
  trimEnd: string
  onTrimStartChange: (value: string) => void
  onTrimEndChange: (value: string) => void
}

// Parse duration string (e.g., "10:30") to seconds
function parseDuration(duration: string): number {
  const parts = duration.split(':')
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10) || 0
    const seconds = parseInt(parts[1], 10) || 0
    return minutes * 60 + seconds
  }
  return 0
}

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function TrimInput({ 
  duration, 
  trimStart, 
  trimEnd, 
  onTrimStartChange, 
  onTrimEndChange 
}: TrimInputProps) {
  const totalSeconds = parseDuration(duration)
  const startSeconds = parseDuration(trimStart) || 0
  const endSeconds = parseDuration(trimEnd) || totalSeconds
  
  // Calculate progress percentage for visual
  const startPercent = totalSeconds > 0 ? (startSeconds / totalSeconds) * 100 : 0
  const endPercent = totalSeconds > 0 ? (endSeconds / totalSeconds) * 100 : 100
  const selectionWidth = endPercent - startPercent

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow partial input (e.g., "1:" or "1:2")
    if (/^(\d*:?\d*)$/.test(value)) {
      onTrimStartChange(value)
    }
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^(\d*:?\d*)$/.test(value)) {
      onTrimEndChange(value)
    }
  }

  const isValid = startSeconds < endSeconds && endSeconds <= totalSeconds

  return (
    <div>
      {/* Section Label */}
      <label className="swiss-type-caption" style={{ display: 'block', marginBottom: '12px', color: '#6B7280' }}>
        Trim Video (Optional)
      </label>

      {/* Trim Controls */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        border: '1px solid #E5E7EB', 
        borderRadius: '8px',
        padding: '16px'
      }}>
        {/* Timeline Visual */}
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          {/* Track */}
          <div style={{ 
            height: '8px', 
            backgroundColor: '#E5E7EB', 
            borderRadius: '4px',
            position: 'relative'
          }}>
            {/* Selected Range */}
            <div style={{
              position: 'absolute',
              left: `${startPercent}%`,
              width: `${selectionWidth}%`,
              height: '100%',
              backgroundColor: '#2563EB',
              borderRadius: '4px'
            }} />
          </div>
          
          {/* Labels */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '8px',
            fontSize: '0.75rem',
            color: '#9CA3AF'
          }}>
            <span>00:00</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* Input Row */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Start Time */}
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.75rem', 
              color: '#6B7280', 
              marginBottom: '6px' 
            }}>
              Start Time
            </label>
            <input
              type="text"
              value={trimStart}
              onChange={handleStartChange}
              placeholder="0:00"
              className="swiss-input"
              style={{ 
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            />
          </div>

          {/* Duration Indicator */}
          <div style={{ 
            padding: '8px 12px', 
            backgroundColor: '#F3F4F6', 
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#6B7280',
            minWidth: '80px',
            textAlign: 'center'
          }}>
            {isValid ? (
              <span>
                {formatTime(endSeconds - startSeconds)}
              </span>
            ) : (
              <span style={{ color: '#EF4444' }}>Invalid</span>
            )}
          </div>

          {/* End Time */}
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.75rem', 
              color: '#6B7280', 
              marginBottom: '6px' 
            }}>
              End Time
            </label>
            <input
              type="text"
              value={trimEnd}
              onChange={handleEndChange}
              placeholder={duration}
              className="swiss-input"
              style={{ 
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              onTrimStartChange('0:00')
              onTrimEndChange('')
            }}
            style={{
              padding: '4px 10px',
              fontSize: '0.7rem',
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: '4px',
              color: '#6B7280',
              cursor: 'pointer'
            }}
          >
            Full Video
          </button>
          <button
            type="button"
            onClick={() => {
              const half = formatTime(Math.floor(totalSeconds / 2))
              onTrimStartChange('0:00')
              onTrimEndChange(half)
            }}
            style={{
              padding: '4px 10px',
              fontSize: '0.7rem',
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: '4px',
              color: '#6B7280',
              cursor: 'pointer'
            }}
          >
            First Half
          </button>
          <button
            type="button"
            onClick={() => {
              const half = formatTime(Math.floor(totalSeconds / 2))
              onTrimStartChange(half)
              onTrimEndChange('')
            }}
            style={{
              padding: '4px 10px',
              fontSize: '0.7rem',
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: '4px',
              color: '#6B7280',
              cursor: 'pointer'
            }}
          >
            Second Half
          </button>
        </div>
      </div>
    </div>
  )
}
