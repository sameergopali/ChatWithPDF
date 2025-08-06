export {};

declare global {
  interface Window {
    electronAPI: {
      readPDFBuffer: (path: string) => Promise<ArrayBuffer | undefined>;
      openPDFDialog: () => Promise<string | undefined>;
    };
  }
}
