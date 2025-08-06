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

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

function App() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [fitMode, setFitMode] = useState<FitMode>('none');
  const [containerWidth, setContainerWidth] = useState<number>(800);
  
  // Chat sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(350);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  
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
        const availableWidth = isSidebarOpen 
          ? containerRef.current.clientWidth - sidebarWidth - 40
          : containerRef.current.clientWidth - 40;
        setContainerWidth(availableWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, [isSidebarOpen, sidebarWidth]);

  // Sidebar resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 250;
      const maxWidth = window.innerWidth * 0.6;
      
      setSidebarWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isResizing]);

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

  const handleZoomIn = () => {
    setFitMode('none');
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setFitMode('none');
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleFitWidth = () => {
    setFitMode('width');
  };

  const handleFitPage = () => {
    setFitMode('page');
  };

  const handleActualSize = () => {
    setFitMode('none');
    setScale(1.0);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'single' ? 'continuous' : 'single');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Chat functionality
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsAiTyping(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: `I understand you're asking about: "${userMessage.text}". I can help you analyze this PDF document. What specific information would you like me to extract or explain?`,
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsAiTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
          <div key={index} style={{ marginBottom: '20px' }}>
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
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Toolbar */}
      <div style={{ 
        padding: '10px 20px', 
        borderBottom: '1px solid #ccc', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        flexWrap: 'wrap',
        backgroundColor: '#f5f5f5',
        zIndex: 10
      }}>
        {/* Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button 
            onClick={goToPrevPage} 
            disabled={pageNumber <= 1 || viewMode === 'continuous'}
            style={{ padding: '5px 10px' }}
          >
            ◀
          </button>
          <span style={{ minWidth: '100px', textAlign: 'center' }}>
            {viewMode === 'single' ? `${pageNumber} / ${numPages || '?'}` : `${numPages || '?'} pages`}
          </span>
          <button 
            onClick={goToNextPage} 
            disabled={pageNumber >= (numPages || 1) || viewMode === 'continuous'}
            style={{ padding: '5px 10px' }}
          >
            ▶
          </button>
        </div>

        {/* View Mode Toggle */}
        <button 
          onClick={toggleViewMode}
          style={{ 
            padding: '5px 10px',
            backgroundColor: viewMode === 'continuous' ? '#007acc' : '#fff',
            color: viewMode === 'continuous' ? '#fff' : '#000',
            border: '1px solid #ccc'
          }}
        >
          {viewMode === 'single' ? 'Continuous' : 'Single Page'}
        </button>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button onClick={handleZoomOut} style={{ padding: '5px 10px' }}>-</button>
          <span style={{ minWidth: '60px', textAlign: 'center' }}>
            {Math.round(calculatedScale * 100)}%
          </span>
          <button onClick={handleZoomIn} style={{ padding: '5px 10px' }}>+</button>
        </div>

        {/* Fit Controls */}
        <div style={{ display: 'flex', gap: '5px' }}>
          <button 
            onClick={handleActualSize}
            style={{ 
              padding: '5px 10px',
              backgroundColor: fitMode === 'none' && scale === 1.0 ? '#007acc' : '#fff',
              color: fitMode === 'none' && scale === 1.0 ? '#fff' : '#000',
              border: '1px solid #ccc'
            }}
          >
            Actual Size
          </button>
          <button 
            onClick={handleFitWidth}
            style={{ 
              padding: '5px 10px',
              backgroundColor: fitMode === 'width' ? '#007acc' : '#fff',
              color: fitMode === 'width' ? '#fff' : '#000',
              border: '1px solid #ccc'
            }}
          >
            Fit Width
          </button>
          <button 
            onClick={handleFitPage}
            style={{ 
              padding: '5px 10px',
              backgroundColor: fitMode === 'page' ? '#007acc' : '#fff',
              color: fitMode === 'page' ? '#fff' : '#000',
              border: '1px solid #ccc'
            }}
          >
            Fit Page
          </button>
        </div>

        {/* Chat Toggle */}
        <button 
          onClick={toggleSidebar}
          style={{ 
            padding: '5px 10px',
            backgroundColor: isSidebarOpen ? '#007acc' : '#fff',
            color: isSidebarOpen ? '#fff' : '#000',
            border: '1px solid #ccc',
            marginLeft: 'auto'
          }}
        >
          💬 AI Chat
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* PDF Viewer Container */}
        <div 
          ref={containerRef}
          style={{ 
            flex: 1, 
            overflow: 'auto', 
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#e5e5e5',
            transition: isSidebarOpen ? 'none' : 'all 0.3s ease'
          }}
        >
          {fileData ? (
            <Document 
              file={fileData} 
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div style={{ padding: '20px' }}>Loading document...</div>}
            >
              {viewMode === 'single' ? renderSinglePage() : renderContinuousPages()}
            </Document>
          ) : (
            <div style={{ padding: '20px' }}>Loading PDF...</div>
          )}
        </div>

        {/* Resizable Sidebar */}
        {isSidebarOpen && (
          <>
            {/* Resize Handle */}
            <div
              ref={resizerRef}
              onMouseDown={() => setIsResizing(true)}
              style={{
                width: '4px',
                backgroundColor: '#ccc',
                cursor: 'col-resize',
                borderLeft: '1px solid #999',
                borderRight: '1px solid #999',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#999'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ccc'}
            />

            {/* Chat Sidebar */}
            <div
              ref={sidebarRef}
              style={{
                width: `${sidebarWidth}px`,
                backgroundColor: '#fff',
                borderLeft: '1px solid #ccc',
                display: 'flex',
                flexDirection: 'column',
                minWidth: '250px'
              }}
            >
              {/* Chat Header */}
              <div style={{
                padding: '15px 20px',
                borderBottom: '1px solid #eee',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>AI Assistant</h3>
                <button
                  onClick={toggleSidebar}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '0',
                    color: '#666'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                style={{
                  flex: 1,
                  padding: '20px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}
              >
                {chatMessages.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    color: '#666',
                    fontStyle: 'italic',
                    padding: '20px'
                  }}>
                    Ask me anything about this PDF document!
                  </div>
                )}

                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%'
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 15px',
                        borderRadius: '18px',
                        backgroundColor: message.sender === 'user' ? '#007acc' : '#f1f3f5',
                        color: message.sender === 'user' ? 'white' : '#333',
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}
                    >
                      {message.text}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#999',
                        marginTop: '5px',
                        textAlign: message.sender === 'user' ? 'right' : 'left'
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div style={{ alignSelf: 'flex-start' }}>
                    <div
                      style={{
                        padding: '10px 15px',
                        borderRadius: '18px',
                        backgroundColor: '#f1f3f5',
                        color: '#666',
                        fontSize: '14px',
                        fontStyle: 'italic'
                      }}
                    >
                      AI is typing...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div style={{
                padding: '15px 20px',
                borderTop: '1px solid #eee',
                backgroundColor: '#fff'
              }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about this PDF..."
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '20px',
                      resize: 'none',
                      minHeight: '20px',
                      maxHeight: '100px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    rows={1}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isAiTyping}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: inputMessage.trim() && !isAiTyping ? '#007acc' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: inputMessage.trim() && !isAiTyping ? 'pointer' : 'not-allowed',
                      fontSize: '14px'
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;