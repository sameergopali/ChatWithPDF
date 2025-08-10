import { ipcMain } from 'electron'
import { DialogService } from '../dialogService.js'
import { PDFService } from '../pdfService.js'
import { AIService } from '../aiService.js'

export interface Services {
  dialogService: DialogService
  pdfService: PDFService
  aiService: AIService
}

export function registerIpcHandlers({ dialogService, pdfService, aiService }: Services): void {
  ipcMain.handle('open-pdf-dialog', async () => {
    return dialogService.openPdfDialog()
  })

  ipcMain.handle('read-pdf-buffer', async (_event, filePath: string) => {
    return pdfService.readPdfAsBase64(filePath)
  })

  ipcMain.on('chat-with-ai', async (event, messages: { text: string; sender: 'user' | 'ai' }[]) => {
    const aiResponse = await aiService.chatWithAI(messages)
    console.log(aiResponse)
    event.sender.send('ai:chat-response', aiResponse)
  })
}


