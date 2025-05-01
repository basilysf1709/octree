'use client';

import { useEffect, useState } from 'react';
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
import { PDFViewer } from '@/components/PDFViewer';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams } from 'next/navigation';
import { defaultLatexContent } from '../default-content';
import { ButtonGroup, ButtonGroupItem } from '@/components/ui/button-group';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

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

  const [content, setContent] = useState(defaultLatexContent);

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

      // Start PDF compilation immediately
      console.log('Starting PDF export...');
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
      console.log('Raw response (first 100 chars):', rawText.substring(0, 100));

      // Parse manually to avoid potential issues
      let data;
      try {
        data = JSON.parse(rawText);
        console.log('JSON parsed successfully');
        console.log('PDF data present:', !!data.pdf);
        console.log('PDF size:', data.size);
        console.log('Base64 length:', data.pdf?.length);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Failed to parse server response');
      }

      // Continue with PDF processing...
      if (data.pdf) {
        console.log('Converting Base64 to binary...');

        // Convert Base64 back to binary
        const binaryString = atob(data.pdf);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        console.log('Creating blob from binary data...');
        // Create downloadable blob
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        console.log('Initiating download...');
        // Download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.pdf';
        document.body.appendChild(a);
        a.click();

        // Clean up
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('Download complete!');
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

  const handleAcceptEdit = (id: string) => {
    const suggestion = editSuggestions.find((s) => s.id === id);
    if (!suggestion || !editor || !monacoInstance) {
      console.log('Missing dependencies:', {
        suggestion: !!suggestion,
        editor: !!editor,
        monaco: !!monacoInstance,
      });
      return;
    }

    const model = editor.getModel();
    if (!model) {
      console.log('No editor model found');
      return;
    }

    // Find the actual lines containing our target text
    let actualStartLine = -1;
    let actualEndLine = -1;

    // Search in a window around the suggested line numbers
    const searchStart = Math.max(1, suggestion.startLine - 5);
    const searchEnd = suggestion.endLine + 5;

    const originalLines = suggestion.original.trim().split('\n');
    const firstOriginalLine = originalLines[0].trim();

    for (let i = searchStart; i <= searchEnd; i++) {
      const lineContent = model.getLineContent(i).trim();
      if (lineContent.includes(firstOriginalLine)) {
        actualStartLine = i;
        // Check subsequent lines if multiline
        let allLinesMatch = true;
        for (let j = 1; j < originalLines.length; j++) {
          const nextLineContent = model.getLineContent(i + j).trim();
          if (!nextLineContent.includes(originalLines[j].trim())) {
            allLinesMatch = false;
            break;
          }
        }
        if (allLinesMatch) {
          actualEndLine = i + originalLines.length - 1;
          break;
        }
      }
    }

    if (actualStartLine === -1 || actualEndLine === -1) {
      console.log('Could not find matching text');
      return;
    }

    const range = new monacoInstance.Range(
      actualStartLine,
      1,
      actualEndLine + 1,
      1
    );

    const edit = {
      range,
      text: suggestion.suggested + '\n',
      forceMoveMarkers: true,
    };

    editor.executeEdits('suggestion', [edit]);
    const newContent = editor.getValue();
    setContent(newContent);

    setEditSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'accepted' } : s))
    );
  };

  const handleRejectEdit = (id: string) => {
    setEditSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'rejected' } : s))
    );
  };

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

  // Update the decoration effect
  useEffect(() => {
    if (!editor || !monacoInstance || editSuggestions.length === 0) {
      return;
    }

    // Clear existing decorations
    if (decorationIds.length) {
      editor.deltaDecorations(decorationIds, []);
      setDecorationIds([]); // Clear the IDs after removing decorations
      return; // Exit early to prevent infinite loop
    }

    // Get pending suggestions
    const pendingSuggestions = editSuggestions.filter(
      (s) => s.status === 'pending'
    );

    // Skip processing if no pending suggestions
    if (pendingSuggestions.length === 0) return;

    // Create decorations for the first pending suggestion only
    const suggestion = pendingSuggestions[0];

    const model = editor.getModel();
    if (!model) return;

    const decorations = [
      // Original text decoration (red)
      {
        range: new monacoInstance.Range(
          suggestion.startLine,
          1,
          suggestion.endLine + 1,
          1
        ),
        options: {
          isWholeLine: false,
          className: 'suggestion-deleted',
          glyphMarginClassName: 'suggestion-glyph',
          glyphMarginHoverMessage: { value: 'Edit suggestion' },
        },
      },
      // Suggested text decoration (green)
      {
        range: new monacoInstance.Range(
          suggestion.startLine,
          1,
          suggestion.endLine + 1,
          1
        ),
        options: {
          isWholeLine: false,
          className: 'suggestion-added',
          after: {
            content: `  ${suggestion.suggested}`,
            inlineClassName: 'suggestion-added',
            attachedData: suggestion.id,
          },
        },
      },
    ];

    // Store new decoration IDs without calling setDecorationIds inside the effect
    const newDecorationIds = editor.deltaDecorations([], decorations);

    // Use a ref to track if we've already set the IDs
    if (newDecorationIds.length > 0) {
      setDecorationIds(newDecorationIds);
    }
  }, [editSuggestions, editor, monacoInstance]); // Remove decorationIds from dependencies

  // Cleanup on unmount (adjust to remove any references to pdfUrl)
  useEffect(() => {
    return () => {
      // No URL objects to revoke now that we're using data URLs
    };
  }, []);

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
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };

    fetchDocument();
  }, [documentId, supabase]);

  function handleCopy() {
    console.log('Copying text');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto h-[calc(100vh-4rem)] px-2 py-2">
        <div className="flex justify-center pt-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Documents</BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>Untitled Document</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-1 flex items-center justify-between">
          <ButtonGroup>
            <ButtonGroupItem>
              <span className="text-sm font-bold">B</span>
            </ButtonGroupItem>
            <ButtonGroupItem>
              <span className="text-sm italic">I</span>
            </ButtonGroupItem>
            <ButtonGroupItem>
              <span className="text-sm underline">U</span>
            </ButtonGroupItem>
          </ButtonGroup>

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
              disabled={exportingPDF}
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
              onMount={(editor, monaco) => {
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

                editor.onDidChangeCursorSelection((event) => {
                  const selection = event.selection;
                  const model = editor.getModel();
                  const text = model?.getValueInRange(selection);

                  if (text && !selection.isEmpty()) {
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
                        top: startCoords.top - 30, // position above the selection
                        left: startCoords.left,
                      });
                      setSelectedText(text);
                      setShowButton(true);
                    }
                  } else {
                    setShowButton(false);
                  }
                });
              }}
            />

            {showButton && (
              <Button
                variant="outline"
                size="xs"
                onClick={handleCopy}
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
          </div>

          <div className="h-full flex-3 overflow-auto">
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
                Lines {suggestion.startLine}-{suggestion.endLine}
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
