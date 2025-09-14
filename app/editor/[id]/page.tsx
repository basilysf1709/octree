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
import PDFViewer from '@/components/pdf-viewer';
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
import { cn, initialContent } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';
import { createClient } from '@/lib/supabase/client';
import { DiffViewer } from '@/components/ui/diff-viewer';
import { UsageIndicator } from '@/components/subscription/usage-indicator';
import { CompilationError } from '@/components/latex/compilation-error';

export default function EditorPage() {
  const supabase = createClient();
  const params = useParams();
  const documentId = params.id as string;

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [buttonPos, setButtonPos] = useState({ top: 0, left: 0 });
  const [showButton, setShowButton] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [textFromEditor, setTextFromEditor] = useState<string | null>(null);

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

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
  }, []);

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState(initialContent);
  const [chatOpen, setChatOpen] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [compilationError, setCompilationError] = useState<{
    message: string;
    details?: string;
    log?: string;
    stdout?: string;
    stderr?: string;
    code?: number;
  } | null>(null);
  const [editSuggestions, setEditSuggestions] = useState<EditSuggestion[]>([]);
  const suggestionQueueRef = useRef<EditSuggestion[]>([]);
  const [editor, setEditor] =
    useState<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<typeof Monaco | null>(
    null
  );
  const [decorationIds, setDecorationIds] = useState<string[]>([]);
  const [exportingPDF, setExportingPDF] = useState(false);

  const initialCompileRef = useRef(false);

  // Auto-compile on content changes (debounced)
  const debouncedAutoCompile = useDebouncedCallback(
    (content: string) => {
      if (!compiling && content.trim()) {
        handleCompile(content);
      }
    },
    2000 // 2 second delay to avoid excessive compilation
  );
  useEffect(() => {
    const fetchAndCompile = async () => {
      if (!documentId) return;

      try {
        const { data, error } = await supabase
          .from('documents')
          .select('content, title')
          .eq('id', documentId)
          .single();

        if (error) throw error;

        if (data) {
          const documentContent = data.content || '';
          setTitle(data.title || '');
          setContent(documentContent);
          setLastSaved(new Date());

          // Schedule compilation after state updates have been applied
          setTimeout(() => {
            if (!initialCompileRef.current && !compiling) {
              initialCompileRef.current = true;
              handleCompile(documentContent);
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };

    fetchAndCompile();
  }, [documentId, supabase]);

  const handleCompile = async (contentToCompile?: string) => {
    if (compiling) return;

    const contentToUse = contentToCompile ?? content;

    setCompiling(true);
    setCompilationError(null); // Clear any previous errors

    try {
      await saveDocument(contentToUse);

      const response = await fetch('/api/compile-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToUse }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Compilation failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.pdf) {
        setPdfData(data.pdf);
        setCompilationError(null); // Clear error on success
      } else {
        console.error('[EditorPage] No PDF data in response');
        throw new Error('No PDF data received');
      }
    } catch (error) {
      console.error('[EditorPage] Compilation error:', error);
      
      // Set compilation error for display
      const errorMessage = error instanceof Error ? error.message : 'Unknown compilation error';
      setCompilationError({
        message: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setCompiling(false);
    }
  };

  const saveDocument = async (contentToSave?: string): Promise<boolean> => {
    if (!documentId) return false;

    try {
      const contentToUse = contentToSave ?? content;
      setIsSaving(true);

      const { error } = await supabase
        .from('documents')
        .update({
          content: contentToUse,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) throw error;

      // Update state if we used a different content
      if (contentToSave !== undefined && contentToSave !== content) {
        setContent(contentToSave);
      }

      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('Error saving document:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);

    try {
      const currentContent = editor?.getValue() || content;

      await saveDocument(currentContent);

      const response = await fetch('/api/compile-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentContent }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'PDF compilation failed');
      }

      const rawText = await response.text();

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Failed to parse server response');
      }

      if (data.pdf) {
        const binaryString = atob(data.pdf);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.pdf';
        document.body.appendChild(a);
        a.click();

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

  const handleEditSuggestion = (suggestion: EditSuggestion | string) => {
    let parsedSuggestion: EditSuggestion;
    if (typeof suggestion === 'string') {
      parsedSuggestion = JSON.parse(suggestion) as EditSuggestion;
    } else {
      parsedSuggestion = suggestion;
    }
    setEditSuggestions([parsedSuggestion]);
  };

  const handleNextSuggestion = () => {
    if (suggestionQueueRef.current.length > 0) {
      const next = suggestionQueueRef.current.shift();
      if (next) setEditSuggestions([next]);
    } else {
      setEditSuggestions([]);
    }
  };

  const handleAcceptEdit = async (suggestionId: string) => {
    const suggestion = editSuggestions.find((s) => s.id === suggestionId);
    if (!suggestion || suggestion.status !== 'pending') return;

    // Check if user can make edits
    try {
      const response = await fetch('/api/track-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check edit limits');
      }

      const data = await response.json();

      if (!data.canEdit) {
        // Show paywall or error message
        alert('You have reached your free edit limit. Please upgrade to Pro for unlimited edits.');
        return;
      }

      // Notify other components to refresh usage data
      window.dispatchEvent(new Event('usage-update'));
    } catch (error) {
      console.error('Error checking edit limits:', error);
      return;
    }

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

      // Check if this is the last suggestion
      const isLastSuggestion = suggestionQueueRef.current.length === 0;

      setTimeout(() => {
        handleNextSuggestion();
        // If this was the last suggestion, compile the document
        if (isLastSuggestion) {
          handleCompile();
        }
      }, 0);
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
    setTimeout(handleNextSuggestion, 0);
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
    const editor = editorRef.current;
    if (!editor || !monacoInstance) {
      return;
    }

    const model = editor.getModel();
    if (!model) {
      return;
    }

    const oldDecorationIds = decorationIds;
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
        return;
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
  }, [editSuggestions, editor, monacoInstance]);

  useEffect(() => {
    return () => {
      if (editorRef.current && decorationIds.length > 0) {
        editorRef.current.deltaDecorations(decorationIds, []);
      }
    };
  }, []);

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
  );

  // Update onMount handler to include better keyboard shortcut handling
  const handleEditorDidMount = (
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco
  ) => {
    editorRef.current = editor;
    setEditor(editor);
    setMonacoInstance(monaco);

    // Add our own key event listener to the editor's DOM node
    // This will run before Monaco's handlers and allows us to prevent default behavior
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.addEventListener('keydown', (e) => {
        // Check for Cmd+S or Ctrl+S
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
          e.preventDefault(); // This prevents browser's save dialog
          e.stopPropagation(); // Stop the event from propagating

          // Get the current content directly from the editor
          const currentContent = editor.getValue();

          // Execute save and compile with current content
          saveDocument(currentContent).then((saved) => {
            if (saved) handleCompile(currentContent);
          });

          return false;
        }
      });
    }

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

    // Add selection change listener for floating button
    editor.onDidChangeCursorSelection((e) => {

    // Auto-compile on content changes
    editor.onDidChangeModelContent(() => {
      const currentContent = editor.getValue();
      debouncedAutoCompile(currentContent);
    });      debouncedCursorSelection(editor);
    });

    // Original Cmd+B command for text selection remains
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
    <div className="min-h-screen bg-slate-100 overflow-x-hidden">
      <div className="mx-auto h-[calc(100vh-4rem)] px-2 py-2 max-w-full overflow-hidden">
        <div className="flex h-6 items-center justify-between py-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Documents</BreadcrumbLink>
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

        <div className="mb-1 flex items-center justify-between min-w-0">
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

          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-background flex w-fit items-center gap-1 rounded-md border border-slate-300 p-1 shadow-xs">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleCompile()}
                disabled={compiling}
              >
                {compiling ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Compiling
                  </>
                ) : (
                  <>
                    Compile
                    <span
                      data-slot="dropdown-menu-shortcut"
                      className={cn(
                        'text-muted-foreground ml-auto text-xs tracking-widest'
                      )}
                    >
                      ⌘S
                    </span>
                  </>
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
            
            {/* Usage Indicator */}
            <UsageIndicator />
          </div>
        </div>

        {/* Compilation Error Display */}
        {compilationError && (
          <CompilationError
            error={compilationError}
            onRetry={() => handleCompile()}
            onDismiss={() => setCompilationError(null)}
          />
        )}

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
                size="sm"
                onClick={() => handleCopy()}
                className="absolute z-10 border border-slate-300 py-3 font-medium"
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

            {/* Enhanced Suggestion Actions with Diff View */}
            <div className="absolute top-1 right-3 z-50 max-w-[350px] space-y-2">
              {editSuggestions
                .filter((s) => s.status === 'pending')
                .map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-white p-4 shadow-xl backdrop-blur-sm max-w-full max-h-96"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-blue-700">
                        Lines {suggestion.startLine}
                        {suggestion.originalLineCount > 1 &&
                          `-${suggestion.startLine + suggestion.originalLineCount - 1}`}
                      </div>
                      <div className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                        AI Suggestion
                      </div>
                    </div>

                    <div className="max-w-full max-h-48 overflow-auto">
                      <DiffViewer
                        original={suggestion.original}
                        suggested={suggestion.suggested}
                        className="max-w-full"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAcceptEdit(suggestion.id)}
                        className="flex-1 border border-green-200 text-green-700 hover:border-green-300 hover:bg-green-50"
                      >
                        <Check size={14} className="mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRejectEdit(suggestion.id)}
                        className="flex-1 border border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
                      >
                        <X size={14} className="mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="h-full flex-1 overflow-auto min-w-0">
            <PDFViewer pdfData={pdfData} isLoading={compiling} />
          </div>
        </div>
      </div>

      <Chat
        isOpen={chatOpen}
        setIsOpen={setChatOpen}
        onEditSuggestion={(suggestionArray) => {
          if (Array.isArray(suggestionArray)) {
            const [first, ...rest] = suggestionArray;
            handleEditSuggestion(first);
            suggestionQueueRef.current = rest.map((s) =>
              typeof s === 'string' ? JSON.parse(s) : s
            );
          } else {
            // Fallback for legacy single suggestion
            handleEditSuggestion(suggestionArray);
            suggestionQueueRef.current = [];
          }
        }}
        fileContent={content}
        textFromEditor={textFromEditor}
        setTextFromEditor={setTextFromEditor}
      />
    </div>
  );
}
