import fs from 'fs'

export class PDFService {
  private indexingInProgress: Map<string, Promise<void>> = new Map()

  async readPdfAsBase64(filePath: string): Promise<string> {
    const pdfBuffer = await fs.promises.readFile(filePath)
    if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
      throw new Error('PDF file is empty or invalid')
    }
    return pdfBuffer.toString('base64')
  }
}


