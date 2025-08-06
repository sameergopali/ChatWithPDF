import { create } from 'zustand';

import { UIState, ContextMenuState } from '../types';

interface UIStore extends UIState {
  // Actions
  contextMenu: ContextMenuState;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setIsResizing: (isResizing: boolean) => void;
  setContainerWidth: (width: number) => void;
  handleSidebarResize: (clientX: number) => void;
  showContextMenu: (x: number, y: number, selectedText: string) => void;
  hideContextMenu: () => void;
}

const initialUIState: UIState = {
  isSidebarOpen: false,
  sidebarWidth: 350,
  isResizing: false,
  containerWidth: 800,
};

export const useUIStore = create<UIStore>((set) => ({
  ...initialUIState,

  toggleSidebar: () => set((state) => ({isSidebarOpen: !state.isSidebarOpen})),
  
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
  setIsResizing: (isResizing) => set({ isResizing }),
  setContainerWidth: (containerWidth) => set({ containerWidth }),
  
  handleSidebarResize: (clientX) => {
    const newWidth = window.innerWidth - clientX;
    const minWidth = 250;
    const maxWidth = window.innerWidth * 0.6;
    
    set({ sidebarWidth: Math.max(minWidth, Math.min(maxWidth, newWidth)) });
  },
  
  contextMenu: {
    isVisible: false,
    x: 0,
    y: 0,
    selectedText: '',
  },

  showContextMenu: (x, y, selectedText) => set({
    contextMenu: { isVisible: true, x, y, selectedText }
  }),

  hideContextMenu: () => set({
    contextMenu: { isVisible: false, x: 0, y: 0, selectedText: '' }
  }),
}));
