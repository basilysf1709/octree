'use client';

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Polyfill for Promise.withResolvers if not available
if (!Promise.withResolvers) {
  (Promise as any).withResolvers = function <T>() {
    let resolve: (value: T) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
  };
}

// Dynamically import the PDF components with no SSR and proper error handling
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
