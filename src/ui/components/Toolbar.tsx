import React from 'react';

import { usePDFStore } from '../stores/pdfStore';
import { useUIStore } from '../stores/uiStore';

export const Toolbar: React.FC = () => {
  const {
    pageNumber,
    numPages,
    viewMode,
    scale,
    fitMode,
    goToPrevPage,
    goToNextPage,
    toggleViewMode,
    zoomIn,
    zoomOut,
    handleFitWidth,
    handleFitPage,
    handleActualSize
  } = usePDFStore();

  const { isSidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="px-5 py-2.5 border-b border-gray-300 flex items-center gap-2.5 flex-wrap bg-gray-50 z-10">
      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <button 
          onClick={goToPrevPage} 
          disabled={pageNumber <= 1 || viewMode === 'continuous'}
          className="px-2.5 py-1 bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          ◀
        </button>
        <span className="min-w-[100px] text-center text-sm">
          {viewMode === 'single' ? `${pageNumber} / ${numPages || '?'}` : `${numPages || '?'} pages`}
        </span>
        <button 
          onClick={goToNextPage} 
          disabled={pageNumber >= (numPages || 1) || viewMode === 'continuous'}
          className="px-2.5 py-1 bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          ▶
        </button>
      </div>

      {/* View Mode Toggle */}
      <button 
        onClick={toggleViewMode}
        className={`px-2.5 py-1 border border-gray-300 rounded ${
          viewMode === 'continuous' 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-black hover:bg-gray-50'
        }`}
      >
        {viewMode === 'single' ? 'Continuous' : 'Single Page'}
      </button>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <button 
          onClick={zoomOut} 
          className="px-2.5 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          -
        </button>
        <span className="min-w-[60px] text-center text-sm">
          {Math.round(scale * 100)}%
        </span>
        <button 
          onClick={zoomIn} 
          className="px-2.5 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          +
        </button>
      </div>

      {/* Fit Controls */}
      <div className="flex gap-1">
        <button 
          onClick={handleActualSize}
          className={`px-2.5 py-1 border border-gray-300 rounded ${
            fitMode === 'none' && scale === 1.0 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-black hover:bg-gray-50'
          }`}
        >
          Actual Size
        </button>
        <button 
          onClick={handleFitWidth}
          className={`px-2.5 py-1 border border-gray-300 rounded ${
            fitMode === 'width' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-black hover:bg-gray-50'
          }`}
        >
          Fit Width
        </button>
        <button 
          onClick={handleFitPage}
          className={`px-2.5 py-1 border border-gray-300 rounded ${
            fitMode === 'page' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-black hover:bg-gray-50'
          }`}
        >
          Fit Page
        </button>
      </div>

      {/* Chat Toggle */}
      <button 
        onClick={toggleSidebar}
        className={`px-2.5 py-1 border border-gray-300 rounded ml-auto ${
          isSidebarOpen 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-black hover:bg-gray-50'
        }`}
      >
        💬 AI Chat
      </button>
    </div>
  );
};
