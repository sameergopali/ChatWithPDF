export type ViewMode = 'single' | 'continuous';
export type FitMode = 'none' | 'width' | 'page';

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// LLM Model Provider Types
export type ModelProviderType =  'google' ;

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
}

export interface ModelProvider {
  id: string;
  type: ModelProviderType;
  apiKey?: string;
  isConfigured: boolean;
  isActive: boolean;
  models: ModelInfo[];
  selectedModelId?: string;
}

export interface LLMConfigState {
  providers: ModelProvider[];
  activeProviderId?: string;

}

// Augment global Window for UI build to access preload API
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Mirror of ElectronAPI exposed from preload; duplicated here to avoid importing from excluded electron code in UI tsconfig
export interface ElectronAPI {
  readPDFBuffer: (path: string) => Promise<Uint8Array>;
  openPDFDialog: () => Promise<string | undefined>;
  chatWithAI: (messages: { text: string; sender: 'user' | 'ai' }[]) => Promise<void>;
  onChatResponse: (
    callback: (event: any, data: any) => void
  ) => () => void;
}

export interface PDFState{
    numPages?: number;
    pageNumber: number;
    scale: number;
    viewMode: ViewMode;
    fitMode: FitMode;
    pdfData: Uint8Array | null;
    loading: boolean;
    error: string | null;
    pdfVersion: number;
}

export interface ChatState {
    messages: ChatMessage[];
    messageInput: string;
    isAiTyping: boolean;
}

export interface UIState {
    isSidebarOpen: boolean;
    sidebarWidth: number;
    isResizing: boolean;
    containerWidth: number;
    isSettingsOpen: boolean;
}

export interface ContextMenuState {
    isVisible: boolean;
    x: number;
    y: number;
    selectedText: string;
}

