import { app, BrowserWindow } from "electron";
import * as path from "path";

// const APP_PORT = process.env.VITE_PORT || '5173';

export function createMainWindow(): BrowserWindow {
  const isDev = !app.isPackaged

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
  })

  if (isDev) {
    win.loadURL(`http://localhost:3000`);
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return win;
}