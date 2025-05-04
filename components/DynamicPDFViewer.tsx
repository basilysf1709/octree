'use client';

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Initialize the worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

interface PDFViewerProps {
  pdfData?: string | null; // Accept null as a possible value
  isLoading?: boolean;
}

function DynamicPDFViewer({ pdfData, isLoading = false }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  
  // Force re-render when page changes
  useEffect(() => {
    console.log(`Page number changed to: ${pageNumber}`);
  }, [pageNumber]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log(`PDF loaded with ${numPages} pages`);
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset: number) {
    const newPageNumber = Math.max(1, Math.min(numPages || 1, pageNumber + offset));
    console.log(`Changing page from ${pageNumber} to ${newPageNumber}`);
    setPageNumber(newPageNumber);
    setPageLoading(true);
  }

  function previousPage(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    changePage(-1);
  }

  function nextPage(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    changePage(1);
  }

  function onPageLoadSuccess() {
    setPageLoading(false);
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!pdfData) {
    return (
      <p className="flex h-full items-center justify-center text-sm whitespace-pre text-slate-600">
        Click <span className="font-semibold">Compile</span> to see the PDF
        preview
      </p>
    );
  }

  // Create a data URL from the Base64 PDF
  const pdfUrl = `data:application/pdf;base64,${pdfData}`;

  return (
    <div className="flex h-full w-full flex-col relative">
      {/* Main PDF viewer area with scrolling */}
      <div className="flex-1 overflow-auto flex justify-center">
        {pageLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          </div>
        )}
        
        <Document 
          file={pdfUrl} 
          options={options}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
              <span className="text-sm text-slate-500">Loading document...</span>
            </div>
          }
        >
          <Page 
            key={`page_${pageNumber}`} // Key for force re-render
            pageNumber={pageNumber} 
            className="border border-slate-200 shadow-sm" 
            onLoadSuccess={onPageLoadSuccess}
            renderTextLayer={false} // Disable text layer for better performance
            renderAnnotationLayer={false} // Disable annotations for better performance
            loading={
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                <span className="text-sm text-slate-500">Loading page...</span>
              </div>
            }
          />
        </Document>
      </div>
      
      {/* Fixed pagination controls at the bottom */}
      {numPages && numPages > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center bg-white/90 backdrop-blur-sm border border-slate-100 rounded-full px-2 py-0.5 shadow-md z-20">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className={`p-0.5 rounded-full transition-colors ${
              pageNumber <= 1 ? 'text-slate-300' : 'text-slate-400 hover:text-blue-500'
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          
          <p className="text-xs text-slate-500 mx-2">
            <span className="font-medium">{pageNumber}</span>
            <span className="mx-1">/</span>
            <span>{numPages}</span>
          </p>
          
          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className={`p-0.5 rounded-full transition-colors ${
              pageNumber >= numPages ? 'text-slate-300' : 'text-slate-400 hover:text-blue-500'
            }`}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default DynamicPDFViewer; 