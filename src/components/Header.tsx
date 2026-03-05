export default function Header() {
  return (
    <header className="py-6 border-b border-dark-700">
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Video Downloader
            </h1>
            <p className="text-xs text-dark-500">Modern & Fast</p>
          </div>
        </div>
        
        {/* Dark Mode Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs text-dark-400">Dark Mode</span>
        </div>
      </div>
    </header>
  )
}
