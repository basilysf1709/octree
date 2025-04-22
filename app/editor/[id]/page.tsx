/* eslint-disable */
'use client';

import { useEffect, useState, useRef } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  latexLanguageConfiguration,
  latexTokenProvider,
  registerLatexCompletions,
} from '@/lib/editor-config';
import { Chat } from '@/components/chat';
import { OctreeLogo } from '@/components/icons/octree-logo';
import { EditSuggestion } from '@/types/edit';
import { Check, X, Loader2 } from 'lucide-react';
import type * as Monaco from 'monaco-editor';
import { PDFViewer } from '@/components/PDFViewer';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams, useRouter } from 'next/navigation';
import { initialContent } from '@/lib/utils';

export default function EditorPage() {
  // Add Supabase client and params
  const supabase = createClientComponentClient();
  const params = useParams();
  const documentId = params.id as string;
  const router = useRouter();

  // Add document metadata state
  const [documentTitle, setDocumentTitle] = useState<string>('LaTeX Document');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Add editor ref
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  // Move Monaco initialization into useEffect
  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.languages.register({ id: 'latex' });
      monaco.languages.setLanguageConfiguration(
        'latex',
        latexLanguageConfiguration
      );
      monaco.languages.setMonarchTokensProvider('latex', latexTokenProvider);
      registerLatexCompletions(monaco);
    });
  }, []); // Empty dependency array means this runs once on mount

  const [content, setContent] = useState(initialContent);

  const [compiling, setCompiling] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [editSuggestions, setEditSuggestions] = useState<EditSuggestion[]>([]);
  const [editor, setEditor] =
    useState<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<typeof Monaco | null>(
    null
  );
  const [decorationIds, setDecorationIds] = useState<string[]>([]);
  const [exportingPDF, setExportingPDF] = useState(false);

  // New function to save document
  const saveDocument = async (): Promise<boolean> => {
    if (!documentId) return false;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('documents')
        .update({
          content: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) throw error;

      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('Error saving document:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update compile handler to show loading immediately
  const handleCompile = async () => {
    // Start loading indicator immediately
    setCompiling(true);

    try {
      // Save document in the background (don't await)
      const savePromise = saveDocument();

      // Start compilation request without waiting for save
      const response = await fetch('/api/compilePDF', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      // Wait for save to complete in the background
      await savePromise;

      if (!response.ok) throw new Error('Compilation failed');

      // Process response
      const data = await response.json();

      if (data.pdf) {
        setPdfData(data.pdf);
      } else {
        throw new Error('No PDF data received');
      }
    } catch (error) {
      console.error('Compilation error:', error);
    } finally {
      setCompiling(false);
    }
  };

  // Also update export handler
  const handleExportPDF = async () => {
    // Start loading indicator immediately
    setExportingPDF(true);

    try {
      // Save document in the background
      const savePromise = saveDocument();

      const response = await fetch('/api/compilePDF', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      // Wait for save to complete in background
      await savePromise;

      if (!response.ok) throw new Error('PDF compilation failed');

      // Log raw response for debugging
      const rawText = await response.text();

      // Parse manually to avoid potential issues
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Failed to parse server response');
      }

      // Continue with PDF processing...
      if (data.pdf) {
        // Convert Base64 back to binary
        const binaryString = atob(data.pdf);
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

  const handleEditSuggestion = (suggestion: EditSuggestion) => {
    setEditSuggestions((prev) => [...prev, suggestion]);
  };

  const handleAcceptEdit = (suggestionId: string) => {
    const suggestion = editSuggestions.find(s => s.id === suggestionId);
    if (!suggestion || suggestion.status !== 'pending') return;
    // Get editor from ref
    const editor = editorRef.current;
    const monaco = monacoInstance;

    if (!editor || !monaco) {
      console.error('Editor or Monaco instance not available.');
      return;
    }

    const model = editor.getModel();
    if (!model) {
      console.error('Editor model not available.');
      return;
    }

    try {
      const startLineNumber = suggestion.startLine;
      const endLineNumber = suggestion.originalLineCount > 0
                           ? startLineNumber + suggestion.originalLineCount - 1
                           : startLineNumber;
      const endColumn = suggestion.originalLineCount > 0
                       ? model.getLineMaxColumn(endLineNumber)
                       : 1;

      const rangeToReplace = new monaco.Range(
        startLineNumber,
        1,
        endLineNumber,
        endColumn
      );

      editor.executeEdits('accept-ai-suggestion', [
        {
          range: rangeToReplace,
          text: suggestion.suggested,
          forceMoveMarkers: true
        }
      ]);

      setEditSuggestions(prev =>
        prev.map(s => s.id === suggestionId ? { ...s, status: 'accepted' } : s)
      );

    } catch (error) {
       console.error("Error applying edit:", error);
       setEditSuggestions(prev =>
         prev.map(s => s.id === suggestionId ? { ...s, status: 'pending' } : s)
       );
    }
  };

  const handleRejectEdit = (suggestionId: string) => {
     setEditSuggestions(prev =>
       prev.map(s => s.id === suggestionId ? { ...s, status: 'rejected' } : s)
     );
  };

  // Update the decoration effect for a clear inline diff view
  useEffect(() => {
    // Ensure editor and monaco are ready
    const editor = editorRef.current; // Get current editor instance
    if (!editor || !monacoInstance) {
      return;
    }

    const model = editor.getModel();
    if (!model) {
      return;
    }

    const oldDecorationIds = decorationIds; // Get IDs of previous decorations
    const newDecorations: Monaco.editor.IModelDeltaDecoration[] = [];

    const pendingSuggestions = editSuggestions.filter(
      (s) => s.status === 'pending'
    );

    pendingSuggestions.forEach((suggestion) => {

      const startLineNumber = suggestion.startLine;
      // Ensure endLineNumber is valid and >= startLineNumber
      const endLineNumber = Math.max(startLineNumber, startLineNumber + suggestion.originalLineCount - 1);

      // Validate line numbers against the current model state
      if (startLineNumber <= 0 || endLineNumber <= 0 || startLineNumber > model.getLineCount() || endLineNumber > model.getLineCount()) {
        console.warn(`Suggestion ${suggestion.id} line numbers [${startLineNumber}-${endLineNumber}] are out of bounds for model line count ${model.getLineCount()}. Skipping decoration.`);
        return; // Skip this suggestion if lines are invalid
      }

      // Calculate end column precisely
      const endColumn = suggestion.originalLineCount > 0
                       ? model.getLineMaxColumn(endLineNumber) // End of the last original line
                       : 1; // Insertion point column 1

      // Define the range for the original text (or insertion point)
      const originalRange = new monacoInstance.Range(
        startLineNumber,
        1, // Start column is always 1
        endLineNumber,
        endColumn
      );

      // --- Decoration 1: Mark original text (if any) + Glyph ---
      if (suggestion.originalLineCount > 0) {
        // Apply red strikethrough to the original range
        newDecorations.push({
          range: originalRange,
          options: {
            className: 'octra-suggestion-deleted', // Red strikethrough style
            glyphMarginClassName: 'octra-suggestion-glyph', // Blue margin indicator
            glyphMarginHoverMessage: { value: `Suggestion: Replace Lines ${startLineNumber}-${endLineNumber}` },
            stickiness: monacoInstance.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        });
      } else {
         // If it's a pure insertion, just add the glyph marker at the start line
         newDecorations.push({
            range: new monacoInstance.Range(startLineNumber, 1, startLineNumber, 1), // Point decoration
            options: {
               glyphMarginClassName: 'octra-suggestion-glyph',
               glyphMarginHoverMessage: { value: `Suggestion: Insert at Line ${startLineNumber}` },
               stickiness: monacoInstance.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            }
         });
      }

      // --- Decoration 2: Show suggested text inline (if any) ---
      if (suggestion.suggested && suggestion.suggested.trim().length > 0) {
          // Use 'after' content widget placed at the end of the original range
          // The range for the 'after' widget itself should be zero-length
          const afterWidgetRange = new monacoInstance.Range(
              endLineNumber, endColumn, endLineNumber, endColumn
          );

          // Prepare suggested content, replacing newlines for inline view
          const inlineSuggestedContent = ` ${suggestion.suggested.replace(/\n/g, ' ↵ ')}`;

          newDecorations.push({
            range: afterWidgetRange, // Position the widget *after* the original range
            options: {
              after: {
                content: inlineSuggestedContent,
                inlineClassName: 'octra-suggestion-added', // Bold green style
              },
              stickiness: monacoInstance.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            },
          });
      }
    });

    // --- Apply Decorations ---
    // This is crucial: deltaDecorations removes old IDs and applies new ones atomically
    const newDecorationIds = editor.deltaDecorations(oldDecorationIds, newDecorations);
    // Update the state to store the IDs of the *currently applied* decorations
    setDecorationIds(newDecorationIds);

  // Dependencies: Re-run when suggestions change, or editor/monaco become available.
  }, [editSuggestions, editor, monacoInstance]); // Removed decorationIds from deps

  // Cleanup on unmount (adjust to remove any references to pdfUrl)
  useEffect(() => {
    return () => {
      // Optional: Clear decorations when component unmounts
      if (editorRef.current && decorationIds.length > 0) {
         editorRef.current.deltaDecorations(decorationIds, []);
      }
    };
  }, []); // Empty dependency array for unmount cleanup

  // Load document on initial render
  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;

      try {
        const { data, error } = await supabase
          .from('documents')
          .select('content, title')
          .eq('id', documentId)
          .single();

        if (error) throw error;

        if (data) {
          setContent(data.content || '');
          setDocumentTitle(data.title || 'LaTeX Document');
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };

    fetchDocument();
  }, [documentId, supabase]);

  // Update onMount handler to store editor ref
  const handleEditorDidMount = (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
    editorRef.current = editor;
    setEditor(editor);
    setMonacoInstance(monaco);
    // Add suggestion actions
    editor.addAction({
      id: 'accept-suggestion',
      label: 'Accept Suggestion',
      contextMenuGroupId: 'suggestion',
      run: (ed) => {
        const position = ed.getPosition();
        if (!position) return;

        const decorations = ed.getLineDecorations(
          position.lineNumber
        );
        const suggestion = decorations?.find(
          (d) =>
            d.options.after && 'attachedData' in d.options.after
        );
        if (
          suggestion?.options.after &&
          'attachedData' in suggestion.options.after
        ) {
          handleAcceptEdit(
            suggestion.options.after.attachedData as string
          );
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <nav className="border-b border-blue-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <OctreeLogo className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-blue-900">Octree</span>
              </Link>
              {lastSaved && (
                <span className="ml-6 text-sm text-gray-500">
                  {isSaving
                    ? 'Saving...'
                    : `Last saved: ${lastSaved.toLocaleTimeString()}`}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleCompile}
                disabled={compiling}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {compiling ? 'Compiling...' : 'Compile'}
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                {exportingPDF ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </div>
                ) : (
                  'Export PDF'
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Editor */}
          <div className="flex-1 rounded-lg bg-white shadow-sm">
            <Editor
              height="80vh"
              defaultLanguage="latex"
              value={content}
              onChange={(value) => setContent(value || '')}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderWhitespace: 'all',
                scrollBeyondLastLine: false,
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: 'allDocuments',
                tabCompletion: 'on',
                suggest: {
                  snippetsPreventQuickSuggestions: false,
                },
              }}
              onMount={handleEditorDidMount}
            />
          </div>

          {/* Preview - Replace with PDFViewer */}
          <div className="flex-1 overflow-auto rounded-lg bg-white p-4 shadow-sm">
            <PDFViewer pdfData={pdfData} isLoading={compiling} />
          </div>
        </div>
      </div>

      {/* Add Chat component */}
      <Chat onEditSuggestion={handleEditSuggestion} fileContent={content} />

      {/* Suggestion Actions */}
      <div className="fixed top-24 right-6 z-50 space-y-2">
        {editSuggestions
          .filter((s) => s.status === 'pending')
          .map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex flex-col gap-2 rounded-lg border border-blue-100 bg-white p-3 shadow-lg"
            >
              <div className="text-sm text-blue-600">
                Lines {suggestion.startLine}-{suggestion.startLine + suggestion.originalLineCount - 1}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAcceptEdit(suggestion.id)}
                  className="flex-1 border border-green-200 text-green-600 hover:bg-green-50"
                >
                  <Check size={14} className="mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRejectEdit(suggestion.id)}
                  className="flex-1 border border-red-200 text-red-600 hover:bg-red-50"
                >
                  <X size={14} className="mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
