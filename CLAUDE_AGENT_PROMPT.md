# Citrus Desktop - AI Agent Instructions

## Project Overview
Electron-based desktop application for Citrus receipt management. Provides native desktop experience with offline capabilities, local file system access, and system integration.

## Technology Stack
- **Platform**: Electron
- **Language**: TypeScript / JavaScript
- **Frontend**: React (renderer process)
- **Build**: Webpack / Electron Builder
- **IPC**: Electron IPC for main/renderer communication

## Project Structure
```
citrus-desktop/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # App entry point
│   │   └── ipc/        # IPC handlers
│   ├── renderer/       # React frontend
│   │   ├── App.tsx     # Main React app
│   │   ├── components/ # UI components
│   │   └── pages/      # Application pages
│   ├── preload/        # Preload scripts
│   └── shared/         # Shared types/utilities
├── public/             # Static assets
└── package.json        # Dependencies
```

## Development Guidelines

### Code Standards
1. **Process Separation**: Respect main/renderer boundaries
2. **IPC Safety**: Validate all IPC messages
3. **File System**: Use Electron safe file operations
4. **Security**: Enable contextIsolation, disable nodeIntegration
5. **Updates**: Handle auto-update flow gracefully

### Testing Your Changes
```bash
npm run build  # Must pass before completion
npm run dev    # Development mode (hot reload)
npm start      # Start built application
```

### Branch Strategy
- **Main branch**: `main`
- **Agent branches**: `claude/agent-{NUMBER}-{description}`
- **Pull Requests**: Always create PRs to main

## Common Tasks

### Adding Main Process Features
1. Update `src/main/`
2. Add IPC handlers if needed
3. Test process communication
4. Handle errors gracefully

### Renderer UI Development
1. Update `src/renderer/` components
2. Use IPC for main process communication
3. Test desktop-specific features
4. Ensure offline functionality

### IPC Communication
1. Define channels in shared types
2. Add handler in main process
3. Add invocation in renderer
4. Validate all data passed

### Adding Native Features
1. Menu bar integration
2. System tray icons
3. Notifications
4. File dialogs
5. System integrations

## Important Notes
- Electron app (not web browser app)
- Main process: Node.js environment
- Renderer process: Browser-like environment
- Use IPC for cross-process communication
- Security: contextIsolation ON, nodeIntegration OFF
- Related: Citrus web app, mobile apps, backend

## Electron Security Checklist
- [ ] contextIsolation: true
- [ ] nodeIntegration: false
- [ ] sandbox: true (if possible)
- [ ] Preload scripts used correctly
- [ ] IPC handlers validate inputs
- [ ] No eval() or remote code execution

## Available Commands
Check `package.json`:
```bash
npm run dev     # Development with hot reload
npm run build   # Build application
npm start       # Run built app
npm run package # Package for distribution
npm run make    # Create installers
```

## Packaging & Distribution
- **Windows**: .exe installer
- **macOS**: .dmg or .app
- **Linux**: .AppImage, .deb, .rpm
- Use electron-builder configuration
- Code signing for production releases

## Current Priorities
1. Improve desktop UI/UX
2. Add native integrations
3. Enhance offline capabilities
4. Optimize performance
5. Update documentation

## Development Workflow
1. Make changes in `src/`
2. Test with `npm run dev`
3. Build with `npm run build`
4. Test packaged app with `npm run package`
5. Verify all IPC communication works

---

**Last Updated**: 2025-11-19
**Maintained By**: Micro-Agent 001
