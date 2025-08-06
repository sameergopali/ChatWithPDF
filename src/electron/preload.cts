import { ipcRenderer, contextBridge } from "electron";


contextBridge.exposeInMainWorld("electronAPI", {
  openPDFDialog:  () => {
    const result =  ipcRenderer.invoke("open-pdf-dialog");
    return result;
  },
  readPDFBuffer: (path: string) => {
    const buffer = ipcRenderer.invoke("read-pdf-buffer", path);
    return buffer;
  }
});