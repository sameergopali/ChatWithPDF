// App.tsx or App.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useLocation } from 'react-router-dom';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type ViewMode = 'single' | 'continuous';
type FitMode = 'none' | 'width' | 'page';

function App() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [fitMode, setFitMode] = useState<FitMode>('none');
  const [containerWidth, setContainerWidth] = useState<number>(800);
  
  const filePath = queryParams.get('filePath') || location.state?.filePath;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error): void {
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }

  // Handle container resize for fit modes
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 40); // Account for padding
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  // Calculate scale based on fit mode
  const calculatedScale = useMemo(() => {
    if (fitMode === 'none') return scale;
    if (fitMode === 'width') return containerWidth / 612; // 612 is default PDF page width
    if (fitMode === 'page') return Math.min(containerWidth / 612, (window.innerHeight - 200) / 792); // 792 is default PDF page height
    return scale;
  }, [fitMode, scale, containerWidth]);

  useEffect(() => {
    const fetchPDFData = async () => {
      if (!filePath) {
        setError('No file path provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const arrayBuffer = await window.electronAPI.readPDFBuffer(filePath);
        const uint8Array = new Uint8Array(arrayBuffer);
        setPdfData(uint8Array);
      } catch (err) {
        setError(`Failed to read PDF file: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchPDFData();
  }, [filePath]);

  const fileData = useMemo(() => (pdfData ? { data: pdfData } : null), [pdfData]);

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  const handleZoomIn = () => {
    setFitMode('none');
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setFitMode('none');
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleFitWidth = () => setFitMode('width');
  const handleFitPage = () => setFitMode('page');
  const handleActualSize = () => {
    setFitMode('none');
    setScale(1.0);
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'single' ? 'continuous' : 'single'));
  };

  const renderSinglePage = () => (
    <Page 
      pageNumber={pageNumber}
      scale={calculatedScale}
      renderTextLayer={true}
      renderAnnotationLayer={true}
    />
  );

  const renderContinuousPages = () => {
    if (!numPages) return null;
    return (
      <div>
        {Array.from({ length: numPages }, (_, index) => (
          <div key={index} className="mb-5">
            <Page 
              pageNumber={index + 1}
              scale={calculatedScale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-5 text-red-600 font-semibold">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 border-b border-gray-300 bg-gray-100">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={goToPrevPage} 
            disabled={pageNumber <= 1 || viewMode === 'continuous'}
            className="px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-gray-300 hover:bg-gray-200"
          >
            ◀
          </button>
          <span className="min-w-[100px] text-center">
            {viewMode === 'single' ? `${pageNumber} / ${numPages || '?'}` : `${numPages || '?'} pages`}
          </span>
          <button 
            onClick={goToNextPage} 
            disabled={pageNumber >= (numPages || 1) || viewMode === 'continuous'}
            className="px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-gray-300 hover:bg-gray-200"
          >
            ▶ 
          </button>
        </div>

        {/* View Mode Toggle */}
        <button 
          onClick={toggleViewMode}
          className={`px-2 py-1 rounded border border-gray-300 ${
            viewMode === 'continuous' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-black hover:bg-gray-200'
          }`}
        >
          {viewMode === 'single' ? 'Continuous' : 'Single Page'}
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleZoomOut} 
            className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-200"
          >
            -
          </button>
          <span className="min-w-[60px] text-center">
            {Math.round(calculatedScale * 100)}%
          </span>
          <button 
            onClick={handleZoomIn} 
            className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-200"
          >
            +
          </button>
        </div>

        {/* Fit Controls */}
        <div className="flex gap-1.5">
          <button 
            onClick={handleActualSize}
            className={`px-2 py-1 rounded border border-gray-300 ${
              fitMode === 'none' && scale === 1.0 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            Actual Size
          </button>
          <button 
            onClick={handleFitWidth}
            className={`px-2 py-1 rounded border border-gray-300 ${
              fitMode === 'width' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            Fit Width
          </button>
          <button 
            onClick={handleFitPage}
            className={`px-2 py-1 rounded border border-gray-300 ${
              fitMode === 'page' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            Fit Page
          </button>
        </div>
      </div>

      {/* PDF Viewer Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-5 flex flex-col items-center bg-gray-200"
      >
        {fileData ? (
          <Document 
            file={fileData} 
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="p-5">Loading document...</div>}
          >
            {viewMode === 'single' ? renderSinglePage() : renderContinuousPages()}
          </Document>
        ) : (
          <div className="p-5">Loading PDF...</div>
        )}
      </div>
    </div>
  );
}

export default App;
