/* eslint-disable */
'use client';

import { useEffect, useState, useRef } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import {
  latexLanguageConfiguration,
  latexTokenProvider,
  registerLatexCompletions,
} from '@/lib/editor-config';
import { Chat } from '@/components/chat';
import { EditSuggestion } from '@/types/edit';
import { Check, X, Loader2 } from 'lucide-react';
import type * as Monaco from 'monaco-editor';
import PDFViewer from '@/components/PDFViewer';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams } from 'next/navigation';
import { ButtonGroup, ButtonGroupItem } from '@/components/ui/button-group';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { initialContent } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';

export default function EditorPage() {
  // Add Supabase client and params
  const supabase = createClientComponentClient();
  const params = useParams();
  const documentId = params.id as string;

  // Add document metadata state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [buttonPos, setButtonPos] = useState({ top: 0, left: 0 });
  const [showButton, setShowButton] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [textFromEditor, setTextFromEditor] = useState<string | null>(null);
  const [textForChatInput, setTextForChatInput] = useState<string | null>(null);

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

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState(initialContent);
  const [chatOpen, setChatOpen] = useState(false);
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

  // Keep track of whether we've attempted initial compilation
  const initialCompileRef = useRef(false);

  // Load document on initial render and compile once after loading
  useEffect(() => {
    const fetchAndCompile = async () => {
      if (!documentId) return;

      try {
        console.log('[EditorPage] Fetching document:', documentId);
        
        const { data, error } = await supabase
          .from('documents')
          .select('content, title')
          .eq('id', documentId)
          .single();

        if (error) throw error;

        if (data) {
          console.log('[EditorPage] Document loaded successfully');
          setTitle(data.title || '');
          setContent(data.content || '');
          setLastSaved(new Date());
          
          // Schedule compilation after state updates have been applied
          setTimeout(() => {
            if (!initialCompileRef.current && !compiling) {
              console.log('[EditorPage] Triggering initial compilation');
              initialCompileRef.current = true;
              handleCompile();
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };

    fetchAndCompile();
  }, [documentId, supabase]);

  // Simplified handleCompile function
  const handleCompile = async () => {
    if (compiling) {
      console.log('[EditorPage] Already compiling, skipping request');
      return;
    }
    
    console.log('[EditorPage] Starting compilation');
    setCompiling(true);
    
    try {
      // Save the document first
      await saveDocument();
      
      // Then compile
      console.log('[EditorPage] Sending compilation request');
      const response = await fetch('/api/compilePDF', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      console.log('[EditorPage] Compilation response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Compilation failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[EditorPage] Compilation response received:', data ? 'has data' : 'empty');
      
      if (data.pdf) {
        console.log('[EditorPage] Setting PDF data, length:', data.pdf.length);
        setPdfData(data.pdf);
      } else {
        console.error('[EditorPage] No PDF data in response');
        throw new Error('No PDF data received');
      }
    } catch (error) {
      console.error('[EditorPage] Compilation error:', error);
    } finally {
      console.log('[EditorPage] Compilation completed');
      setCompiling(false);
    }
  };

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
    const suggestion = editSuggestions.find((s) => s.id === suggestionId);
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
      const endLineNumber =
        suggestion.originalLineCount > 0
          ? startLineNumber + suggestion.originalLineCount - 1
          : startLineNumber;
      const endColumn =
        suggestion.originalLineCount > 0
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
          forceMoveMarkers: true,
        },
      ]);

      setEditSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId ? { ...s, status: 'accepted' } : s
        )
      );
    } catch (error) {
      console.error('Error applying edit:', error);
      setEditSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId ? { ...s, status: 'pending' } : s
        )
      );
    }
  };

  const handleRejectEdit = (suggestionId: string) => {
    setEditSuggestions((prev) =>
      prev.map((s) =>
        s.id === suggestionId ? { ...s, status: 'rejected' } : s
      )
    );
  };

  const handleTextFormat = (format: 'bold' | 'italic' | 'underline') => {
    const editor = editorRef.current;
    const monaco = monacoInstance;
    if (!editor || !monaco) return;

    const selection = editor.getSelection();
    if (!selection || selection.isEmpty()) return;

    const model = editor.getModel();
    if (!model) return;

    const selectedText = model.getValueInRange(selection);

    const formatMap = {
      bold: { command: '\\textbf', length: 8 },
      italic: { command: '\\textit', length: 8 },
      underline: { command: '\\underline', length: 11 },
    };

    const { command, length } = formatMap[format];
    let newText;
    if (selectedText.startsWith(`${command}{`) && selectedText.endsWith('}')) {
      newText = selectedText.slice(length, -1);
    } else {
      newText = `${command}{${selectedText}}`;
    }

    editor.executeEdits(format, [
      {
        range: selection,
        text: newText,
        forceMoveMarkers: true,
      },
    ]);

    const newEndColumn = selection.startColumn + newText.length;
    editor.setSelection(
      new monaco.Selection(
        selection.startLineNumber,
        selection.startColumn,
        selection.startLineNumber,
        newEndColumn
      )
    );
    editor.focus();
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
      const endLineNumber = Math.max(
        startLineNumber,
        startLineNumber + suggestion.originalLineCount - 1
      );

      // Validate line numbers against the current model state
      if (
        startLineNumber <= 0 ||
        endLineNumber <= 0 ||
        startLineNumber > model.getLineCount() ||
        endLineNumber > model.getLineCount()
      ) {
        console.warn(
          `Suggestion ${suggestion.id} line numbers [${startLineNumber}-${endLineNumber}] are out of bounds for model line count ${model.getLineCount()}. Skipping decoration.`
        );
        return; // Skip this suggestion if lines are invalid
      }

      // Calculate end column precisely
      const endColumn =
        suggestion.originalLineCount > 0
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
            glyphMarginHoverMessage: {
              value: `Suggestion: Replace Lines ${startLineNumber}-${endLineNumber}`,
            },
            stickiness:
              monacoInstance.editor.TrackedRangeStickiness
                .NeverGrowsWhenTypingAtEdges,
          },
        });
      } else {
        // If it's a pure insertion, just add the glyph marker at the start line
        newDecorations.push({
          range: new monacoInstance.Range(
            startLineNumber,
            1,
            startLineNumber,
            1
          ), // Point decoration
          options: {
            glyphMarginClassName: 'octra-suggestion-glyph',
            glyphMarginHoverMessage: {
              value: `Suggestion: Insert at Line ${startLineNumber}`,
            },
            stickiness:
              monacoInstance.editor.TrackedRangeStickiness
                .NeverGrowsWhenTypingAtEdges,
          },
        });
      }

      // --- Decoration 2: Show suggested text inline (if any) ---
      if (suggestion.suggested && suggestion.suggested.trim().length > 0) {
        // Use 'after' content widget placed at the end of the original range
        // The range for the 'after' widget itself should be zero-length
        const afterWidgetRange = new monacoInstance.Range(
          endLineNumber,
          endColumn,
          endLineNumber,
          endColumn
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
            stickiness:
              monacoInstance.editor.TrackedRangeStickiness
                .NeverGrowsWhenTypingAtEdges,
          },
        });
      }
    });

    // --- Apply Decorations ---
    // This is crucial: deltaDecorations removes old IDs and applies new ones atomically
    const newDecorationIds = editor.deltaDecorations(
      oldDecorationIds,
      newDecorations
    );
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

  // Modify handleCopy to set the new state
  function handleCopy(textToCopy?: string) {
    const currentSelectedText = textToCopy ?? selectedText;

    if (currentSelectedText.trim()) {
      setTextFromEditor(currentSelectedText);
      setShowButton(false);
    }
  }

  const debouncedCursorSelection = useDebouncedCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor) => {
      const selection = editor.getSelection();
      const model = editor.getModel();
      const text = model?.getValueInRange(selection!);

      if (text && selection && !selection?.isEmpty()) {
        const range = {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn,
        };
        const startCoords = editor.getScrolledVisiblePosition({
          lineNumber: range.startLineNumber,
          column: range.startColumn,
        });

        if (startCoords) {
          setButtonPos({
            top: startCoords.top - 30,
            left: startCoords.left,
          });
          setSelectedText(text);
          setShowButton(true);
        }
      } else {
        setShowButton(false);
        setSelectedText('');
      }
    },
    200
  ); // debounce delay in ms

  // Update onMount handler to store editor ref AND add Cmd+B shortcut
  const handleEditorDidMount = (
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco
  ) => {
    editorRef.current = editor;
    setEditor(editor);
    setMonacoInstance(monaco);

    // Add suggestion actions (Accept/Reject in context menu)
    editor.addAction({
      id: 'accept-suggestion',
      label: 'Accept Suggestion',
      contextMenuGroupId: 'suggestion',
      run: (ed) => {
        const position = ed.getPosition();
        if (!position) return;

        const decorations = ed.getLineDecorations(position.lineNumber);
        const suggestion = decorations?.find(
          (d) => d.options.after && 'attachedData' in d.options.after
        );
        if (
          suggestion?.options.after &&
          'attachedData' in suggestion.options.after
        ) {
          handleAcceptEdit(suggestion.options.after.attachedData as string);
        }
      },
    });

    // Listener for selection change (updates state for the button)
    editor.onDidChangeCursorSelection((e) => {
      if (e.selection.isEmpty()) {
        setShowButton(false);
        setSelectedText('');
      } else {
        debouncedCursorSelection(editor);
      }
    });

    // Add scroll event listener to hide button when editor is scrolled
    editor.onDidScrollChange(() => {
      setShowButton(false);
    });

    // Cmd+B shortcut - calls handleCopy which now sets textForChatInput
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB,
      () => {
        const currentEditor = editorRef.current;
        if (!currentEditor) {
          console.error('[EditorPage] Cmd+B Error: editorRef is not set.');
          return;
        }

        const selection = currentEditor.getSelection();
        if (!selection || selection.isEmpty()) {
          return;
        }

        const model = currentEditor.getModel();
        if (!model) {
          return;
        }

        const directlySelectedText = model.getValueInRange(selection);

        if (directlySelectedText && directlySelectedText.trim()) {
          handleCopy(directlySelectedText);
        }
      },
      'editorTextFocus'
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto h-[calc(100vh-4rem)] px-2 py-2">
        <div className="relative flex h-6 justify-end gap-1 py-1">
          <Breadcrumb className="absolute top-1 left-1/2 -translate-x-1/2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Documents</BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {lastSaved && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="mb-1 flex items-center justify-between">
          <ButtonGroup>
            <ButtonGroupItem onClick={() => handleTextFormat('bold')}>
              <span className="text-sm font-bold">B</span>
            </ButtonGroupItem>
            <ButtonGroupItem onClick={() => handleTextFormat('italic')}>
              <span className="text-sm italic">I</span>
            </ButtonGroupItem>
            <ButtonGroupItem onClick={() => handleTextFormat('underline')}>
              <span className="text-sm underline">U</span>
            </ButtonGroupItem>
          </ButtonGroup>

          <div className="flex items-center gap-2">
            <div className="bg-background flex w-fit items-center gap-1 rounded-md border border-slate-300 p-1 shadow-xs">
              <Button
                variant="ghost"
                size="xs"
                onClick={handleCompile}
                disabled={compiling}
              >
                {compiling ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Compiling
                  </>
                ) : (
                  'Compile'
                )}
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleExportPDF}
                disabled={exportingPDF || isSaving}
              >
                {exportingPDF ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Exporting
                  </>
                ) : (
                  'Export'
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-full gap-1">
          <div className="relative h-full flex-4 overflow-hidden rounded-md bg-white shadow-sm">
            <Editor
              height="100%"
              defaultLanguage="latex"
              value={content}
              onChange={(value) => setContent(value || '')}
              theme="vs-light"
              options={{
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                  scrollByPage: false,
                  ignoreHorizontalScrollbarInContentHeight: false,
                },
                minimap: { enabled: false },
                fontSize: 13,
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
                padding: {
                  top: 10,
                  bottom: 10,
                },
              }}
              onMount={handleEditorDidMount}
            />

            {/* Floating Button - still uses handleCopy without args, relying on state */}
            {showButton && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleCopy()} // Button click uses state via default arg
                className="absolute z-10 py-3 font-medium"
                style={{
                  top: buttonPos.top,
                  left: buttonPos.left,
                }}
              >
                Edit
                <kbd className="text-muted-foreground ml-auto pt-0.5 font-mono text-xs tracking-widest">
                  ⌘B
                </kbd>
              </Button>
            )}

            {/* Suggestion Actions */}
            <div className="absolute top-1 right-3 z-50 space-y-2">
              {editSuggestions
                .filter((s) => s.status === 'pending')
                .map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex flex-col gap-2 rounded-lg border border-blue-100 bg-white p-3 shadow-lg"
                  >
                    <div className="text-sm text-blue-600">
                      Lines {suggestion.startLine}-
                      {suggestion.startLine + suggestion.originalLineCount - 1}
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

          <div className="h-full flex-3 overflow-auto">
            <PDFViewer pdfData={pdfData} isLoading={compiling} />
          </div>
        </div>
      </div>

      {/* Add Chat component */}
      <Chat
        isOpen={chatOpen}
        setIsOpen={setChatOpen}
        onEditSuggestion={handleEditSuggestion}
        fileContent={content}
        textFromEditor={textFromEditor}
        setTextFromEditor={setTextFromEditor}
      />
    </div>
  );
}
