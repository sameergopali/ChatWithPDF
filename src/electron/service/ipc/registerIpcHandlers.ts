import { ipcMain } from 'electron'
import { DialogService } from '../dialogService.js'
import { PDFService } from '../pdfService.js'
import { AIService } from '../aiService.js'
import { RagService } from '../ragService.js'

export interface Services {
  dialogService: DialogService
  pdfService: PDFService
  aiService: AIService
  ragService: RagService
}

export function registerIpcHandlers({ dialogService, pdfService, aiService, ragService }: Services): void {
  ipcMain.handle('open-pdf-dialog', async () => {
    return dialogService.openPdfDialog()
  })

  ipcMain.handle('read-pdf-buffer', async (_event, filePath: string) => {
    ragService.init(filePath)
    return pdfService.readPdfAsBase64(filePath)

  })

  ipcMain.on('chat-with-ai', async (event, messages: { text: string; sender: 'user' | 'ai' }[]) => {
    const aiResponse = await aiService.chatWithAI(messages)
    console.log(aiResponse)
    event.sender.send('ai:chat-response', aiResponse)
  })
}


