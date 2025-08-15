"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const windowManager_1 = require("./windowManager.cjs");
// đăng ký IPC-Inter_Process_Communication handler
// import "./ipc"
let mainWindow = null;
electron_1.app.whenReady().then(() => {
    mainWindow = (0, windowManager_1.createMainWindow)();

    // Khởi đầu cấu hình menu
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                { role: 'quit', accelerator: 'CmdOrCtrl+Q' }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'F5', // Thay đổi phím tắt thành F5
                    click: (menuItem, browserWindow) => {
                        if (browserWindow) {
                            browserWindow.reload();
                        }
                    }
                },
                { role: 'forceReload' },
                { type: 'separator' },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'F12', // Thay đổi phím tắt thành F12
                    click: (menuItem, browserWindow) => {
                        if (browserWindow) {
                            browserWindow.webContents.toggleDevTools();
                        }
                    }
                }
            ]
        }
    ];

    const menu = electron_1.Menu.buildFromTemplate(menuTemplate);
    electron_1.Menu.setApplicationMenu(menu);

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