import { ipcRenderer, contextBridge } from "electron";


contextBridge.exposeInMainWorld("electronAPI", {
  openPDFDialog: async () =>  {
    const result =  await ipcRenderer.invoke("open-pdf-dialog");
    return result;
  },
  readPDFBuffer: async (path: string): Promise<Uint8Array> => {
    const base64 = await ipcRenderer.invoke("read-pdf-buffer", path);
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer;
  }
});