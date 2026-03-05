interface DownloadButtonProps {
  onClick: () => void
  isLoading: boolean
  outputPath: string
  onPathChange: (path: string) => void
  onSelectDirectory: () => void
}

export default function DownloadButton({ onClick, isLoading, outputPath, onPathChange, onSelectDirectory }: DownloadButtonProps) {
  const handleOpenFolder = async () => {
    if (outputPath) {
      await window.electronAPI.openFolder(outputPath)
    }
  }

  return (
    <div>
      {/* Output Path Section */}
      <div style={{ marginBottom: '16px' }}>
        <label className="swiss-type-caption" style={{ display: 'block', marginBottom: '8px', color: '#6B7280' }}>
          Download Location
        </label>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Path Input */}
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <input
              type="text"
              value={outputPath}
              onChange={(e) => onPathChange(e.target.value)}
              disabled={isLoading}
              className="swiss-input"
              style={{ 
                paddingLeft: '40px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                color: '#1F2937',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            />
          </div>
          
          {/* Select Folder Button */}
          <button
            type="button"
            onClick={onSelectDirectory}
            disabled={isLoading}
            style={{
              padding: '12px 14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
            title="Select folder"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>
          
          {/* Open Folder Button */}
          <button
            type="button"
            onClick={handleOpenFolder}
            disabled={isLoading || !outputPath}
            style={{
              padding: '12px 14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: (isLoading || !outputPath) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || !outputPath) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
            title="Open folder"
            onMouseEnter={(e) => {
              if (!isLoading && outputPath) {
                e.currentTarget.style.borderColor = '#2563EB'
                e.currentTarget.style.backgroundColor = '#DBEAFE'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB'
              e.currentTarget.style.backgroundColor = '#FFFFFF'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Download Button - Soft Blue Primary */}
      <button
        onClick={onClick}
        disabled={isLoading || !outputPath}
        className="swiss-button swiss-button-soft"
        style={{ 
          width: '100%',
          padding: '16px 24px',
          fontSize: '1rem',
          fontWeight: '600',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          cursor: (isLoading || !outputPath) ? 'not-allowed' : 'pointer',
          opacity: (isLoading || !outputPath) ? 0.6 : 1,
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
        }}
      >
        {isLoading ? (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
            </svg>
            <span>Downloading...</span>
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Video</span>
          </>
        )}
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
