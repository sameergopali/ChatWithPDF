import {create} from 'zustand';

import { PDFState, ViewMode,FitMode } from '../types';


interface PDFStore extends PDFState {
  // Actions
  setNumPages: (numPages: number) => void;
  setPageNumber: (pageNumber: number) => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  setScale: (scale: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setViewMode: (viewMode: ViewMode) => void;
  toggleViewMode: () => void;
  setFitMode: (fitMode: FitMode) => void;
  handleFitWidth: () => void;
  handleFitPage: () => void;
  handleActualSize: () => void;
  setPdfData: (data: Uint8Array | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}                                     


const initialState: PDFState = {
  numPages: undefined,
  pageNumber: 1,
  scale: 1.0,
  viewMode: 'single',
  fitMode: 'none',
  pdfData: null,
  pdfVersion: 0,
  loading: true,
  error: null,
};


export const usePDFStore = create<PDFStore>((set) => ({
  ...initialState,

  setNumPages: (numPages) => set({ numPages }),
  setPageNumber: (pageNumber) => set({ pageNumber }),
  
  goToPrevPage: () => set((state) => ({
    pageNumber: Math.max(state.pageNumber - 1, 1)
  })),
  
  goToNextPage: () => set((state) => ({
    pageNumber: Math.min(state.pageNumber + 1, state.numPages || 1)
  })),
  
  setScale: (scale) => set({ scale }),
  
  zoomIn: () => set((state) => ({
    fitMode: 'none',
    scale: Math.min(state.scale + 0.25, 3.0)
  })),
  
  zoomOut: () => set((state) => ({
    fitMode: 'none',
    scale: Math.max(state.scale - 0.25, 0.25)
  })),
  
  setViewMode: (viewMode) => set({ viewMode }),
  toggleViewMode: () => set((state) => ({
    viewMode: state.viewMode === 'single' ? 'continuous' : 'single'
  })),
  
  setFitMode: (fitMode) => set({ fitMode }),
  handleFitWidth: () => set({ fitMode: 'width' }),
  handleFitPage: () => set({ fitMode: 'page' }),
  handleActualSize: () => set({ fitMode: 'none', scale: 1.0 }),

  setPdfData: (pdfData) => { set({ pdfData }); },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  reset: () => set(initialState),
}));