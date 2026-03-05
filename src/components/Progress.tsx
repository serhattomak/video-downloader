import { ProgressData } from '../types'

interface ProgressProps {
  progress: ProgressData
}

export default function Progress({ progress }: ProgressProps) {
  // Extract percentage from filename if available
  const getProgressPercent = () => {
    const match = progress.filename.match(/(\d+\.?\d*)%/)
    if (match) {
      return parseFloat(match[1])
    }
    return 0
  }

  const percent = getProgressPercent()

  return (
    <div className="swiss-card" style={{ 
      padding: '16px', 
      backgroundColor: '#FFFFFF',
      boxShadow: '0 1px 5px rgba(0,0,0,0.04)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span className="swiss-type-small" style={{ fontWeight: '500', color: '#4B5563' }}>Downloading</span>
        <span className="swiss-type-small" style={{ fontWeight: '600', color: '#2563EB' }}>
          {percent > 0 ? `${percent.toFixed(1)}%` : ''}
        </span>
      </div>

      {/* Progress Bar - Soft Blue */}
      <div className="swiss-progress" style={{ marginBottom: '12px' }}>
        <div 
          className="swiss-progress-bar" 
          style={{ 
            width: `${percent > 0 ? percent : 5}%`,
            backgroundColor: '#2563EB'
          }}
        />
      </div>

      {/* Status Text */}
      <p className="swiss-type-small" style={{ 
        color: '#9CA3AF', 
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {progress.filename}
      </p>
    </div>
  )
}
