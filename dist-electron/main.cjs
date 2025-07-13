"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const windowManager_1 = require("./windowManager.cjs");
// đăng ký IPC-Inter_Process_Communication handler
// import "./ipc"
let mainWindow = null;
electron_1.app.whenReady().then(() => {
    mainWindow = (0, windowManager_1.createMainWindow)();
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.app.on('activate', () => {
    if (mainWindow === null) {
        mainWindow = (0, windowManager_1.createMainWindow)();
    }
});
//# sourceMappingURL=main.js.map