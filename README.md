# 🍊 Citrus Desktop

Desktop application for receipt management with webcam scanner, bulk operations, offline sync, and power tools.

Part of Citrus Enterprise Platform.

## Features

✨ **Webcam Receipt Capture** - Capture receipts directly from your webcam
📤 **Drag-Drop Upload** - Easy file upload with drag and drop support
🔄 **Bulk Operations** - Select and manage multiple receipts at once
💾 **Offline Mode** - Works completely offline with automatic sync when online
✏️ **Receipt Annotation** - Add notes and highlights to your receipts
📊 **Report Builder** - Generate and export detailed reports
🎯 **System Tray** - Quick access from your system tray

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **React** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **electron-store** - Persistent offline storage

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Start development server
npm run dev

# In another terminal, start the app
npm start
```

## Building

```bash
# Build the app
npm run build

# Package for current platform
npm run package

# Package for all platforms (Mac/Windows/Linux)
npm run package:all
```

## Usage

1. **Upload Receipts**: Drag and drop receipt images or click to select files
2. **Webcam Capture**: Use your webcam to capture physical receipts
3. **Manage Receipts**: View all your receipts in a grid layout
4. **Bulk Operations**: Select multiple receipts to delete or export
5. **Annotate**: Click any receipt to add notes and annotations
6. **Reports**: Generate filtered reports and export them

## Offline Mode

The app works completely offline. All receipts are stored locally using electron-store. When you come back online, the app will automatically sync your data.

## System Tray

The app minimizes to the system tray for quick access:
- Click the tray icon to show the app
- Right-click for quick capture and other options

## Cross-Platform Support

Builds are configured for:
- **macOS**: DMG installer
- **Windows**: NSIS installer
- **Linux**: AppImage and Deb packages

## License

MIT
