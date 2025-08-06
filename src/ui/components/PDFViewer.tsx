import React, { useEffect, useMemo, useRef } from 'react';
import { UserSquare } from 'lucide-react';
import { Document, Page } from 'react-pdf';

import { usePDFStore } from '../stores/pdfStore';
import { useUIStore } from '../stores/uiStore';

interface PDFViewerProps {
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
  onDocumentLoadError: (error: Error) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  onDocumentLoadSuccess,
  onDocumentLoadError
}) => {
   
  const { pdfData, pageNumber, numPages, scale, viewMode, fitMode } = usePDFStore();
  const { containerWidth, showContextMenu, hideContextMenu } = useUIStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';
        if (selectedText.length > 0) {
        const rect = containerRef.current?.getBoundingClientRect();
        const x = event.clientX;
        const y = event.clientY;
        
        // Ensure context menu stays within viewport
        const menuWidth = 200; // Approximate menu width
        const menuHeight = 150; // Approximate menu height
        const adjustedX = x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : x;
        const adjustedY = y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : y;
        showContextMenu(adjustedX, adjustedY, selectedText);
        }
  };
  const fileData = useMemo(() => {
    return pdfData ? { data: pdfData } : null;
  }, [pdfData]);


  const calculatedScale = useMemo(() => {
    if (fitMode === 'none') return scale;
    if (fitMode === 'width') return containerWidth / 612;
    if (fitMode === 'page') return Math.min(containerWidth / 612, (window.innerHeight - 200) / 792);
    return scale;
  }, [fitMode, scale, containerWidth]);

  const renderSinglePage = () => (
    <Page 
      pageNumber={pageNumber}
      scale={calculatedScale}
      renderTextLayer={true}
      renderAnnotationLayer={true}
      className="shadow-lg"
    />
  );

  const renderContinuousPages = () => {
    if (!numPages) return null;
    
    return (
      <div className="space-y-5">
        {Array.from({ length: numPages }, (_, index) => (
          <div key={index}>
            <Page 
              pageNumber={index + 1}
              scale={calculatedScale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-lg"
            />
          </div>
        ))}
      </div>
    );
  };

  if (!fileData) {
    return <div className="p-5 text-center text-gray-600">No PDF Data...</div>;
  }

  return (
    <div ref={containerRef}
    onContextMenu={handleContextMenu}
    >
      <Document 
        file={fileData} 
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<div className="p-5 text-center text-gray-600">Loading document...</div>}
    >
      {viewMode === 'single' ? renderSinglePage() : renderContinuousPages()}
    </Document>
    </div>
  );
};
