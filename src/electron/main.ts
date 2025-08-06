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
        resizable: true,
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

    ipcMain.handle('read-pdf-buffer', async ( _,filePath) => {
    try {
        const pdfBuffer = await fs.promises.readFile(filePath);

        if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
        throw new Error('PDF file is empty or invalid');
        }

        return pdfBuffer.toString('base64'); // This is a Node.js Buffer
    } catch (error) {
        console.error('Error reading PDF file:', error);
        throw error; // Propagates to renderer as rejected promise
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