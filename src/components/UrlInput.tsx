interface UrlInputProps {
  url: string
  onUrlChange: (url: string) => void
  onSubmit: () => void
  isLoading: boolean
  ytDlpInstalled: boolean | null
}

export default function UrlInput({ url, onUrlChange, onSubmit, isLoading, ytDlpInstalled }: UrlInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      onSubmit()
    }
  }

  const platforms = ['YouTube', 'X (Twitter)', 'Instagram', 'TikTok', 'Facebook']

  const isDisabled = isLoading || ytDlpInstalled === false

  return (
    <div>
      {/* Section Label */}
      <label htmlFor="url" className="swiss-type-caption" style={{ display: 'block', marginBottom: '8px', color: '#6B7280' }}>
        Video URL
      </label>
      
      {/* Input Row */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ 
            position: 'absolute', 
            left: '14px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste video URL here..."
            disabled={isDisabled}
            className="swiss-input"
            style={{ 
              paddingLeft: '44px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              color: '#1F2937',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          />
        </div>
        
        {/* Submit Button - Soft Blue */}
        <button
          onClick={onSubmit}
          disabled={isDisabled || !url.trim()}
          className="swiss-button swiss-button-soft"
          style={{ 
            padding: '14px 24px',
            minWidth: '130px',
            borderRadius: '8px',
            fontWeight: '500',
            boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)'
          }}
        >
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
              </svg>
              <span>Loading</span>
            </div>
          ) : (
            <span>Analyze</span>
          )}
        </button>
      </div>

      {/* Supported Platforms - Minimal Pills */}
      <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {platforms.map((platform) => (
          <span
            key={platform}
            style={{
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: '500',
              color: '#6B7280',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '4px'
            }}
          >
            {platform}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
