import { dialog } from 'electron'

export class DialogService {
  async openPdfDialog(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
      properties: ['openFile'],
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  }
}


