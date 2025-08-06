export type ViewMode = 'single' | 'continuous';
export type FitMode = 'none' | 'width' | 'page';


export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
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
}

export interface ContextMenuState {
    isVisible: boolean;
    x: number;
    y: number;
    selectedText: string;
}