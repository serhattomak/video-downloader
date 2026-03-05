import type { VideoInfo } from '../types'

interface VideoInfoProps {
  video: VideoInfo
}

export default function VideoInfo({ video }: VideoInfoProps) {
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'YouTube':
        return 'bg-red-500'
      case 'X (Twitter)':
        return 'bg-sky-500'
      case 'Instagram':
        return 'bg-pink-500'
      case 'TikTok':
        return 'bg-cyan-500'
      case 'Facebook':
        return 'bg-blue-600'
      default:
        return 'bg-dark-500'
    }
  }

  return (
    <div className="mt-8 p-6 bg-dark-800/50 border border-dark-700/50 rounded-2xl">
      <div className="flex gap-6">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-48 h-28 object-cover rounded-xl"
            />
          ) : (
            <div className="w-48 h-28 bg-dark-700 rounded-xl flex items-center justify-center">
              <svg className="w-12 h-12 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2.5 py-1 text-xs font-medium text-white rounded-md ${getPlatformColor(video.platform)}`}>
              {video.platform}
            </span>
            <span className="text-xs text-dark-500">
              {video.duration}
            </span>
          </div>

          <h2 className="text-lg font-semibold text-dark-100 line-clamp-2 mb-2">
            {video.title}
          </h2>

          <p className="text-sm text-dark-400">
            {video.uploader}
          </p>
        </div>
      </div>
    </div>
  )
}
