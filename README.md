# Video Downloader

A desktop application for downloading videos from YouTube, X (Twitter), Instagram, TikTok, and Facebook. Built with Electron, React, and Tailwind CSS.

![Video Downloader](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)

## Features

- **Multi-Platform Support**: Download videos from YouTube, X (Twitter), Instagram, TikTok, and Facebook
- **Format Selection**: Choose from various video formats and quality options
- **Progress Tracking**: Real-time download progress with status updates
- **Auto Installation**: Automatic yt-dlp installation (or manual fallback)
- **Custom Output Directory**: Select your preferred download location
- **Clean UI**: Modern Swiss design interface built with Tailwind CSS

## Supported Platforms

| Platform | URL Examples |
|----------|--------------|
| YouTube | `youtube.com`, `youtu.be` |
| X (Twitter) | `twitter.com`, `x.com` |
| Instagram | `instagram.com` |
| TikTok | `tiktok.com` |
| Facebook | `facebook.com`, `fb.watch` |

## Requirements

### System Requirements

- **Operating System**: Windows 10/11 (64-bit)
- **Processor**: Intel Core i3 or equivalent
- **Memory**: 4GB RAM minimum
- **Storage**: 200MB for application files

### Dependencies

- **yt-dlp**: Video downloading engine (automatically installed or manual)

## Installation

### Option 1: Portable Executable (Recommended)

1. Download the latest `Video Downloader-x.x.x-Portable.exe` from the [releases](https://github.com/your-repo/releases)
2. Run the executable - no installation required
3. The app will prompt you to install yt-dlp on first use

### Option 2: Installer

1. Download the `Video Downloader-Setup-x.x.x.exe` installer
2. Run the installer and follow the prompts
3. Choose your installation directory
4. Launch from Start Menu or Desktop shortcut

### Manual yt-dlp Installation

If automatic installation fails, install yt-dlp manually:

```powershell
# Option A: Using pip
python -m pip install yt-dlp --upgrade

# Option B: Using winget
winget install yt-dlp.yt-dlp

# Option C: Download directly
# Download from: https://github.com/yt-dlp/yt-dlp/releases
```

## Development

### Prerequisites

- Node.js 18+
- Python 3.8+ (for yt-dlp)
- npm or yarn

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript |
| Styling | Tailwind CSS 3.4 |
| Desktop | Electron 33 |
| Build Tool | Vite 5 |
| Video Engine | yt-dlp |
| Logging | electron-log |

### Project Structure

```
video-downloader/
├── electron/
│   ├── main.ts           # Electron main process
│   └── preload.ts       # Preload script (IPC bridge)
├── src/
│   ├── components/
│   │   ├── DownloadButton.tsx
│   │   ├── FormatSelector.tsx
│   │   ├── Header.tsx
│   │   ├── Progress.tsx
│   │   ├── UrlInput.tsx
│   │   └── VideoInfo.tsx
│   ├── App.tsx          # Main application component
│   ├── index.css        # Global styles
│   ├── main.tsx         # React entry point
│   └── types.ts         # TypeScript interfaces
├── resources/
│   └── yt-dlp.exe       # Bundled yt-dlp (optional)
├── dist/                # Built frontend assets
├── dist-electron/       # Built Electron files
├── release/             # Packaged executables
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Getting Started

```bash
# Clone the repository
git clone https://github.com/your-repo/video-downloader.git
cd video-downloader

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Building the Application

```bash
# Build installer and portable versions
npm run build

# Build only portable version
npm run build:portable
```

Output files are located in the `release/` directory.

## Usage Guide

### 1. Launch the Application

Start Video Downloader from your desktop or Start Menu.

### 2. Enter Video URL

Paste the URL of the video you want to download in the input field.

### 3. Select Format

After fetching video information, choose your preferred format:
- **Best Available**: Highest quality (video + audio)
- **Best Video**: Highest quality video only
- **Best Audio**: Audio only (MP3/M4A)
- **Custom**: Select specific format ID

### 4. Choose Download Location

Click the folder icon to select your preferred download directory (defaults to your system's Downloads folder).

### 5. Download

Click the "Download" button and monitor progress in real-time.

### 6. Access Downloaded Files

Once complete, click "Open Folder" to view your downloaded video.

## API Integration

### IPC Channels

The Electron main process exposes the following IPC handlers:

| Channel | Parameters | Returns |
|---------|------------|---------|
| `check-yt-dlp` | - | `boolean` |
| `install-yt-dlp` | - | `string` |
| `get-video-info` | `url: string` | `VideoInfo` |
| `get-formats` | `url: string` | `VideoFormat[]` |
| `download-video` | `{url, formatId, outputDir}` | `string` |
| `get-download-path` | - | `string` |
| `select-directory` | - | `string \| null` |
| `open-folder` | `path: string` | `boolean` |

### Events

| Event | Data |
|-------|------|
| `download-progress` | `{filename: string}` |
| `download-complete` | `string` |

## Troubleshooting

### yt-dlp Not Found

If you see "yt-dlp Required" warning:

1. Click the "Install" button to attempt automatic installation
2. If automatic install fails, manually install yt-dlp (see Installation section)
3. Restart the application

### Download Fails

Common causes:

- **Invalid URL**: Ensure the URL is correct and publicly accessible
- **Video Unavailable**: The video may be private, region-locked, or removed
- **Format Not Available**: Try "Best Available" option

### Permission Denied

If downloads fail due to permissions:

1. Choose a different download directory
2. Run the application as Administrator

## Configuration

### Custom yt-dlp Path

The application checks for yt-dlp in this order:

1. Bundled `yt-dlp.exe` in app resources folder
2. System PATH
3. Python module (`python -m yt_dlp`)

### Logging

Logs are stored in:
- Windows: `%APPDATA%/video-downloader/logs/`

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Video downloading engine
- [Electron](https://www.electronjs.org/) - Desktop app framework
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
