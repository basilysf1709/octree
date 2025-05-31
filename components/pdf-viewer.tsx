'use client';

import { Loader2 } from 'lucide-react';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import dynamic from 'next/dynamic';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Dynamically import the PDF components with no SSR
const DynamicPDFViewer = dynamic(() => import('@/components/dynamic-pdf-viewer'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="text-primary h-6 w-6 animate-spin" />
      <span className="ml-2 text-slate-500">Loading PDF viewer...</span>
    </div>
  )
});

export default DynamicPDFViewer;
