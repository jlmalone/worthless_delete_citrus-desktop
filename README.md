# 🍊 Citrus Desktop

A powerful cross-platform desktop application for receipt management with webcam scanning, offline sync, and advanced power tools.

## Features

- **📸 Webcam Receipt Capture**: Capture receipts directly from your webcam
- **📁 Drag & Drop Upload**: Easy drag-and-drop file upload for batch processing
- **📋 Bulk Operations**: Manage multiple receipts at once with bulk actions
- **💾 Offline Mode**: Full offline functionality with automatic local storage
- **🔄 Auto-Sync**: Seamless cloud synchronization when back online
- **✏️ Receipt Annotation**: Add notes and annotations to your receipts
- **📊 Report Builder**: Generate customizable reports in HTML or JSON format
- **🖥️ System Tray**: Minimize to system tray for quick access

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Desktop Framework**: Tauri 2.0
- **Storage**: LocalForage (IndexedDB)
- **Styling**: Custom CSS

## Installation

```bash
# Install dependencies
npm install

# Install Rust (required for Tauri)
# Visit https://www.rust-lang.org/tools/install
```

## Development

```bash
# Run in development mode (Tauri + Vite)
npm run tauri:dev

# Run web version only
npm run dev
```

## Building

```bash
# Build for production
npm run build

# Build desktop app (requires Rust)
npm run tauri:build
```

## Cross-Platform Support

Citrus Desktop runs on:
- 🪟 Windows 10/11
- 🍎 macOS 10.13+
- 🐧 Linux (Ubuntu, Debian, Fedora, etc.)

## Project Structure

```
citrus-desktop/
├── src/                    # React source files
│   ├── components/         # React components
│   │   ├── WebcamCapture.tsx
│   │   ├── DragDropUpload.tsx
│   │   ├── BulkOperations.tsx
│   │   ├── ReceiptAnnotation.tsx
│   │   ├── ReportBuilder.tsx
│   │   └── OfflineSync.tsx
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── src-tauri/             # Tauri (Rust) backend
│   ├── src/
│   │   └── main.rs        # Tauri main with system tray
│   └── tauri.conf.json    # Tauri configuration
├── public/                # Static assets
└── package.json           # Dependencies

```

## Usage

1. **Capture Receipts**: Click the "Capture" tab and use your webcam to scan receipts
2. **Upload Files**: Drag and drop receipt images in the "Upload" tab
3. **Manage Receipts**: Use "Bulk Ops" to select and perform actions on multiple receipts
4. **Annotate**: Add notes and annotations in the "Annotate" tab
5. **Generate Reports**: Create customized reports in the "Reports" tab
6. **Sync**: Monitor sync status and manage offline data in the "Sync" tab

## Offline Mode

All receipts are automatically saved to local storage (IndexedDB). You can:
- Continue using the app without internet connection
- Receipts are saved locally in real-time
- Sync with cloud when connection is restored
- Data persists between sessions

## License

Part of Citrus Enterprise Platform.
