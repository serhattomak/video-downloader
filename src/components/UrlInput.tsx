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

  return (
    <div className="mt-6">
      <label htmlFor="url" className="block text-sm font-medium text-dark-400 mb-2">
        Video URL
      </label>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste video URL here..."
            disabled={isLoading || ytDlpInstalled === false}
            className="w-full pl-12 pr-4 py-4 bg-dark-800 border border-dark-600 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={isLoading || !url.trim() || ytDlpInstalled === false}
          className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-dark-600 disabled:to-dark-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Analyze</span>
            </>
          )}
        </button>
      </div>

      {/* Supported Platforms */}
      <div className="mt-4 flex flex-wrap gap-2">
        {['YouTube', 'X (Twitter)', 'Instagram', 'TikTok', 'Facebook'].map((platform) => (
          <span
            key={platform}
            className="px-3 py-1 text-xs text-dark-500 bg-dark-800/50 rounded-full"
          >
            {platform}
          </span>
        ))}
      </div>
    </div>
  )
}
