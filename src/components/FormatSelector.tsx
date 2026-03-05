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
    <div className="mt-6">
      <label className="block text-sm font-medium text-dark-400 mb-3">
        Select Quality
      </label>

      {/* Quick Options */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => onSelect('best')}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            selectedFormat === 'best'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
              : 'bg-dark-800/50 border-dark-600 hover:border-dark-500 text-dark-300'
          }`}
        >
          Best Quality (MP4)
        </button>
        <button
          onClick={() => onSelect('bestaudio')}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            selectedFormat === 'bestaudio'
              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
              : 'bg-dark-800/50 border-dark-600 hover:border-dark-500 text-dark-300'
          }`}
        >
          Audio Only
        </button>
      </div>

      {/* Video Formats */}
      {videoFormats.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-medium text-dark-500 uppercase tracking-wider mb-2">Video (Manual)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {videoFormats.map((format) => (
              <button
                key={format.format_id}
                onClick={() => onSelect(format.format_id)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  selectedFormat === format.format_id
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                    : 'bg-dark-800/50 border-dark-600 hover:border-dark-500 text-dark-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{format.resolution}</span>
                  <span className="text-xs text-dark-500">{format.ext.toUpperCase()}</span>
                </div>
                {format.filesize && format.filesize !== 'Unknown' && (
                  <span className="text-xs text-dark-500">{format.filesize}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audio Formats */}
      {audioFormats.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-dark-500 uppercase tracking-wider mb-2">Audio Only (Manual)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {audioFormats.map((format) => (
              <button
                key={format.format_id}
                onClick={() => onSelect(format.format_id)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  selectedFormat === format.format_id
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                    : 'bg-dark-800/50 border-dark-600 hover:border-dark-500 text-dark-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">Audio</span>
                  <span className="text-xs text-dark-500">{format.ext.toUpperCase()}</span>
                </div>
                {format.filesize && format.filesize !== 'Unknown' && (
                  <span className="text-xs text-dark-500">{format.filesize}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
