'use client';

import { useState, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { saveDocument } from '@/actions/save-document';
import { compilePdf } from '@/lib/requests/compilation';

export interface DocumentOperationsState {
  isSaving: boolean;
  lastSaved: Date | null;
  compiling: boolean;
  pdfData: string | null;
  exportingPDF: boolean;
  handleSaveDocument: (contentToSave?: string) => Promise<boolean>;
  handleCompile: (contentToCompile?: string) => Promise<void>;
  handleExportPDF: () => Promise<void>;
  debouncedAutoCompile: (content: string) => void;
  setLastSaved: (date: Date | null) => void;
}

interface UseDocumentOperationsProps {
  projectId: string;
  content: string;
  editor?: any;
}

export function useDocumentOperations({
  projectId,
  content,
  editor,
}: UseDocumentOperationsProps): DocumentOperationsState {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);

  const handleSaveDocument = async (
    contentToSave?: string
  ): Promise<boolean> => {
    if (!projectId) return false;

    // Use provided content or fall back to state
    const contentToUse = contentToSave !== undefined ? contentToSave : content;

    try {
      setIsSaving(true);

      const result = await saveDocument(projectId, contentToUse);

      if (result.success) {
        setLastSaved(new Date());
        return true;
      } else {
        console.error('Error saving document:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error saving document:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompile = async (contentToCompile?: string): Promise<void> => {
    if (compiling) {
      return;
    }

    // Use provided content or fall back to state
    const contentToUse =
      contentToCompile !== undefined ? contentToCompile : content;

    setCompiling(true);

    try {
      // First save the document
      const saveResult = await saveDocument(projectId, contentToUse);

      if (!saveResult.success) {
        console.error('[useDocumentOperations] Save error:', saveResult.error);
        return;
      }

      setLastSaved(new Date());

      // Then compile using requests module
      const compileResult = await compilePdf(contentToUse);

      if (compileResult.success && compileResult.pdfData) {
        setPdfData(compileResult.pdfData);
      } else {
        console.error(
          '[useDocumentOperations] Compilation error:',
          compileResult.error
        );
        throw new Error(compileResult.error || 'Compilation failed');
      }
    } catch (error) {
      console.error('[useDocumentOperations] Compilation error:', error);
    } finally {
      setCompiling(false);
    }
  };

  const handleExportPDF = async (): Promise<void> => {
    // Start loading indicator immediately
    setExportingPDF(true);

    try {
      // Get the latest content
      const currentContent = editor?.getValue() || content;

      // Save document in the background
      const savePromise = handleSaveDocument(currentContent);

      // Compile PDF for export using requests module
      const compileResult = await compilePdf(currentContent);

      // Wait for save to complete in background
      await savePromise;

      if (!compileResult.success || !compileResult.pdfData) {
        throw new Error(compileResult.error || 'PDF compilation failed');
      }

      // Continue with PDF processing...
      if (compileResult.pdfData) {
        // Convert Base64 back to binary
        const binaryString = atob(compileResult.pdfData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Create downloadable blob
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.pdf';
        document.body.appendChild(a);
        a.click();

        // Clean up
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('No PDF data received from server');
      }
    } catch (error) {
      console.error('PDF export error:', error);
    } finally {
      setExportingPDF(false);
    }
  };

  // Auto-compile on content changes (debounced)
  const debouncedAutoCompile = useDebouncedCallback(
    (content: string) => {
      if (!compiling && content.trim()) {
        handleCompile(content);
      }
    },
    2000 // 2 second delay to avoid excessive compilation
  );

  return {
    isSaving,
    lastSaved,
    compiling,
    pdfData,
    exportingPDF,
    handleSaveDocument,
    handleCompile,
    handleExportPDF,
    debouncedAutoCompile,
    setLastSaved,
  };
}
