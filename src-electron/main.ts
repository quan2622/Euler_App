import { app } from 'electron'
import { createMainWindow } from "./windowManager";

// đăng ký IPC-Inter_Process_Communication handler
// import "./ipc"

let mainWindow: Electron.BrowserWindow | null = null;

app.whenReady().then(() => {
  mainWindow = createMainWindow();

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});