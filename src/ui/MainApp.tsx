import React, { useRef } from 'react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useLocation } from 'react-router-dom';

import { ChatSidebar } from './components/ChatSidebar';
import { ContextMenu } from './components/contextMenu';
import { PDFViewer } from './components/PDFViewer';
import { ResizeHandle } from './components/ResizeHandle';
import { Toolbar } from './components/Toolbar';
import { useContainerWidth } from './hooks/useContainerWidth';
import { usePDFData } from './hooks/usePDFData';
import { useSidebarResize } from './hooks/useSidebarResize';
import { usePDFStore } from './stores/pdfStore';
import { useUIStore } from './stores/uiStore';


function MainApp() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { loading, error } = usePDFStore();
  const { isSidebarOpen } = useUIStore();

  const filePath = location.state?.filePath;

  // Initialize hooks
  const { handleDocumentLoadSuccess, handleDocumentLoadError } = usePDFData(filePath);
  useContainerWidth(containerRef);
  useSidebarResize();

  if (error) {
    return (
      <div className="p-5 text-red-600 text-center">
        Error: {error}
      </div>
    );
  }

  

  return (
    <div className="flex flex-col h-screen">
      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        <div 
          ref={containerRef}
          className={`flex-1 overflow-auto p-5 flex flex-col items-center bg-gray-200 ${
            isSidebarOpen ? '' : 'transition-all duration-300'
          }`}
        >
          <PDFViewer
            onDocumentLoadSuccess={handleDocumentLoadSuccess}
            onDocumentLoadError={handleDocumentLoadError}
          />
        </div>

        {isSidebarOpen && (
          <>
            <ResizeHandle />
            <ChatSidebar />
          </>
        )}
      </div>
      
      <ContextMenu/>
    </div>
  );
}

export default MainApp;