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
    <div className="mt-8 space-y-4">
      {/* Output Path */}
      <div>
        <label className="block text-sm font-medium text-dark-400 mb-2">
          Download Location
        </label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <input
              type="text"
              value={outputPath}
              onChange={(e) => onPathChange(e.target.value)}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            onClick={onSelectDirectory}
            disabled={isLoading}
            className="px-4 py-3 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-xl transition-colors disabled:opacity-50"
            title="Select folder"
          >
            <svg className="w-5 h-5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleOpenFolder}
            disabled={isLoading || !outputPath}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Open folder"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={onClick}
        disabled={isLoading || !outputPath}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-dark-600 disabled:to-dark-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Downloading...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Video</span>
          </>
        )}
      </button>
    </div>
  )
}
