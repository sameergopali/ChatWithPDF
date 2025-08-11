import { app, BrowserWindow } from 'electron'
import path from 'path'
import dotenv from "dotenv";

import { getPreloadPath } from './pathResolver.js'
import { isDev } from './util.js'
import { DialogService } from './service/dialogService.js'
import { PDFService } from './service/pdfService.js'
import { AIService } from './service/aiService.js'
import { registerIpcHandlers } from './service/ipc/registerIpcHandlers.js'
import { RagService } from './service/ragService.js'

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
    dotenv.config()
    const ragService =  new RagService()
    const services = {
        dialogService: new DialogService(),
        pdfService: new PDFService(),
        aiService: new AIService(ragService),
        ragService: ragService,
    }
    registerIpcHandlers(services)

}

app.on('ready', () => {        
    createWindow();
}
);
app.on('window-all-closed', () => {
    app.quit();
});           