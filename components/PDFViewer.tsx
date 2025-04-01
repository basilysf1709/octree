import React from 'react';

interface PDFViewerProps {
  pdfData?: string | null; // Accept null as a possible value
  isLoading?: boolean;
}

export function PDFViewer({ pdfData, isLoading = false }: PDFViewerProps) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!pdfData) {
    return (
      <div className="h-full flex items-center justify-center text-blue-600">
        Click &quot;Compile&quot; to see the PDF preview
      </div>
    );
  }

  // Create a data URL from the Base64 PDF
  const pdfUrl = `data:application/pdf;base64,${pdfData}`;
  
  // Create a URL with parameters to control the PDF viewer appearance
  const viewerUrl = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&page=1&view=FitH`;

  return (
    <div className="h-full w-full">
      <iframe
        src={viewerUrl}
        className="w-full h-[80vh] border-none"
        title="PDF Viewer"
      />
    </div>
  );
} 