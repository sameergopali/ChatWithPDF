import { ipcRenderer, contextBridge } from "electron";

export interface ElectronAPI {
  readPDFBuffer: (path: string) => Promise<Uint8Array>;
  openPDFDialog: () => Promise<string | undefined>;
  chatWithAI: (messages: { text: string; sender: 'user' | 'ai' }[]) => Promise<void>;
  onChatResponse: (
    callback: (event: any, data: any) => void
  ) => () => void; // returns unsubscribe
}

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
  },
  chatWithAI: (messages: { text: string; sender: 'user' | 'ai' }[]) => {
    return ipcRenderer.send("chat-with-ai", messages);
  },
  onChatResponse: (callback: (event: any, data: any) => void) => {
    ipcRenderer.on("ai:chat-response", callback);
    return () => ipcRenderer.removeListener("ai:chat-response", callback);
  }
  
});