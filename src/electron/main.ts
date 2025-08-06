import {app, BrowserWindow, ipcMain, dialog} from 'electron';
import fs from 'fs'
import { get } from 'http';
import path from 'path';
import { buffer } from 'stream/consumers';
import { fileURLToPath } from 'url';

import { getPreloadPath } from './pathResolver.js';
import { isDev } from './util.js';

function createWindow() {
    
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        resizable: true,
        titleBarStyle: 'hiddenInset',
        movable: true,
        webPreferences: {
            preload: getPreloadPath(),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });
        
    if (isDev()) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }

    ipcMain.handle('open-pdf-dialog', async () => {
        const result = await dialog.showOpenDialog({
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
            properties: ['openFile'],
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    });

    ipcMain.handle('read-pdf-buffer',  (event, filePath) => {
        try {
            const pdf =  fs.readFileSync(filePath);
            console.log('PDF file read successfully:', filePath);
            return pdf.buffer; // Return the ArrayBuffer
        } catch (error) {
            console.error('Error reading PDF file:', error);
            throw error; // Propagate the error to the renderer process
        }
    });

}

app.on('ready', () => {        
    createWindow();
}
);
app.on('window-all-closed', () => {
    app.quit();
});           