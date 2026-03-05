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
    <div className="mt-8 p-6 bg-dark-800/50 border border-dark-700/50 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-dark-300">Downloading...</span>
        <span className="text-sm font-semibold text-emerald-400">
          {percent > 0 ? `${percent.toFixed(1)}%` : ''}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-dark-700 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
          style={{ width: `${percent > 0 ? percent : 5}%` }}
        />
      </div>

      {/* Status */}
      <div className="space-y-1">
        <p className="text-sm text-dark-400 truncate">{progress.filename}</p>
      </div>
    </div>
  )
}
