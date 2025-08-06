// App.tsx or App.jsx
import { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useLocation } from 'react-router-dom';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function App() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const filePath = queryParams.get('filePath') || location.state?.filePath;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error): void {
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }

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
        // Convert ArrayBuffer to Uint8Array to avoid detached buffer issues
        const uint8Array = new Uint8Array(arrayBuffer);
        setPdfData(uint8Array);
      } catch (err) {
        setError(`Failed to read PDF file: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchPDFData();
  }, [filePath]);

  // Memoize the file prop to prevent unnecessary reloads
  const fileData = useMemo(() => {
    return pdfData ? { data: pdfData } : null;
  }, [pdfData]);

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {fileData ? (
        <>
          <Document 
            file={fileData} 
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<p>Loading document...</p>}
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
          
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={goToPrevPage} 
              disabled={pageNumber <= 1}
              style={{ marginRight: '10px' }}
            >
              Previous
            </button>
            
            <span style={{ margin: '0 10px' }}>
              Page {pageNumber} of {numPages || '?'}
            </span>
            
            <button 
              onClick={goToNextPage} 
              disabled={pageNumber >= (numPages || 1)}
              style={{ marginLeft: '10px' }}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p>Loading PDF...</p>
      )}
    </div>
  );
}

export default App;