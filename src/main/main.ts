import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import Store from 'electron-store';

const store = new Store();

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../../assets/icon.png')
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

function createTray() {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAICSURBVFiF7ZbPaxNBFMc/b5JNk00bE1tR0FawHhQR/4AieBAvHjx58OJF8OhVPHnw4sWDBy8evHj14MWDBy8e/AMEQQQPogdRUEFtQdpYm2STbDY7HmZ3s5tkN1vwKPjFsLPz3nzfm/d2ZgZWWGE5kP/bAUTkGnB7OdaqqlcBRKRdVe8tQ/IKMArgA5eAq8AqoAn0gEngB/AR+AqMA7NLIa8BduImHgd6gU3AGuAosBZ4DXwHfgE9wAbgJHAO2A98An4vYO8M8NTqduMmrwEPgBrQAZwB9mJCAI+BM8Ae4CJwEhgC7gM37XlPiL0IcB6YAA4Dh3AT1+xC54DzgAdMANeB55YcwXZg2OpjJlQNtADbgGvAReCW1UeBfcDVED9R0wpTe63RwEh/XDthQzwMaY0Bb1CuAa+Ac0HH9B77vg84CDwDPgN/7PMm8AZ4jzsU1+CG5rCN0Q3cAU5YfRS3Sw4BT3BDUMGdbGATfWeTdQNP8CdgE/gAnAZuA/uwXWPjzaG4uwFQZ2FzFcmLWrYG3AAO2M4ZAXbirnMH6AN22nP6I3EVuAQctTr7cQdX7/feB+TtXGWSwvoV+/0IfAGm7LkJvLNJyxZ/F3jkO/AO+AlM45+LdVsrZfqAa8BpH0Eb6MSdfH8XWY9LXgCqVt8C1Fm4C/4CfgM/rL1SavkLqmSbjMVWR10AAAAASUVORK5CYII='
  );

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Citrus', click: () => mainWindow?.show() },
    { label: 'Quick Capture', click: () => {
      mainWindow?.show();
      mainWindow?.webContents.send('quick-capture');
    }},
    { type: 'separator' },
    { label: 'Quit', click: () => {
      app.isQuitting = true;
      app.quit();
    }}
  ]);

  tray.setToolTip('Citrus Desktop');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow?.show();
  });
}

// IPC handlers for offline storage
ipcMain.handle('store-get', (_event, key: string) => {
  return store.get(key);
});

ipcMain.handle('store-set', (_event, key: string, value: any) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('store-delete', (_event, key: string) => {
  store.delete(key);
  return true;
});

ipcMain.handle('store-clear', () => {
  store.clear();
  return true;
});

ipcMain.handle('store-get-all', () => {
  return store.store;
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});
