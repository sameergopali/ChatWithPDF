import { useEffect, useRef } from 'react';

import { usePDFStore } from '../stores/pdfStore';

export const usePDFData = (filePath: string | null) => {
    const {  setPdfData, setLoading, setError, setNumPages } = usePDFStore();
    const lastloadedPathRef = useRef<string|null>(null);


    useEffect(() => {
        const fetchPDFData = async () => {
        if (filePath == null || lastloadedPathRef.current === filePath) {
            return;
        }
        lastloadedPathRef.current = filePath; // Update the ref to the current filePath
        console.log('Fetching PDF data for:', filePath);
        try {
            setLoading(true);
            setError(null);
            const arrayBuffer = await window.electronAPI.readPDFBuffer(filePath);
            console.log('Fetched PDF data:', arrayBuffer);
            setPdfData(arrayBuffer);
        } catch (err) {
            setError(`Failed to read PDF file: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setLoading(false);
        }
    };

        fetchPDFData();
    }, [filePath]);

  

    const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const handleDocumentLoadError = (error: Error) => {
        setError(`Failed to load PDF: ${error.message}`);
        setLoading(false);
    };

    return { handleDocumentLoadSuccess, handleDocumentLoadError };
    };
