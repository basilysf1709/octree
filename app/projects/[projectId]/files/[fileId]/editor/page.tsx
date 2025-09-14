'use client';

import { useEffect, useState, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import Editor, { loader } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type * as Monaco from 'monaco-editor';
import PDFViewer from '@/components/pdf-viewer';
import { createClient } from '@/lib/supabase/client';
import { useDebouncedCallback } from 'use-debounce';
import { ButtonGroup, ButtonGroupItem } from '@/components/ui/button-group';
import {
  latexLanguageConfiguration,
  latexTokenProvider,
  registerLatexCompletions,
} from '@/lib/editor-config';
import { Chat } from '@/components/chat';
import { EditSuggestion } from '@/types/edit';
import { UsageIndicator } from '@/components/subscription/usage-indicator';
import { CompilationError } from '@/components/latex/compilation-error';

export default function FileEditorPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const projectId = params.projectId as string;
  const fileId = params.fileId as string;

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<{
    id: string;
    title: string;
    user_id: string;
    created_at: string | null;
    updated_at: string | null;
  } | null>(null);
  const [file, setFile] = useState<{
    id: string;
    name: string;
    project_id: string;
    size: number | null;
    type: string | null;
    uploaded_at: string | null;
  } | null>(null);
  const [documentData, setDocumentData] = useState<{
    id: string;
    title: string;
    content: string;
    owner_id: string;
    project_id: string;
    filename: string;
    document_type: string;
    created_at: string | null;
    updated_at: string | null;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [editSuggestions, setEditSuggestions] = useState<EditSuggestion[]>([]);
  const [textFromEditor, setTextFromEditor] = useState<string | null>(null);
  const [buttonPos, setButtonPos] = useState({ top: 0, left: 0 });
  const [showButton, setShowButton] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const suggestionQueueRef = useRef<EditSuggestion[]>([]);

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  // Debounced auto-save function
  const debouncedSave = useDebouncedCallback(
    (content: string) => {
      saveDocument(content);
    },
    2000 // Save after 2 seconds of inactivity
  );


  // Auto-compile on content changes (debounced)
  const debouncedAutoCompile = useDebouncedCallback(
    (content: string) => {
      if (!compiling && content.trim()) {
        handleCompile();
      }
    },
    2000 // 2 second delay to avoid excessive compilation
  );  // Initialize Monaco
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

  // Load file and document
  useEffect(() => {
    const fetchFile = async () => {
      if (!projectId || !fileId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/auth/login');
          return;
        }

        // Fetch the project
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .eq('user_id', session.user.id)
          .single();

        if (projectError) {
          throw new Error('Project not found');
        }

        setProject(projectData);

        // Fetch the specific file and its document
        const response = await fetch(`/api/projects/${projectId}/files/${fileId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('File not found');
          }
          throw new Error('Failed to fetch file');
        }

        const { file: fileData, document: documentData } = await response.json();

        setFile(fileData);
        setDocumentData(documentData);
        setTitle(documentData.title);
        setContent(documentData.content);

        setIsLoading(false);

      } catch (error) {
        console.error('Error loading file:', error);
        setError(error instanceof Error ? error.message : 'Failed to load file');
        setIsLoading(false);
      }
    };

    fetchFile();
  }, [projectId, fileId, supabase, router, pathname]);

  const saveDocument = async (contentToSave?: string): Promise<boolean> => {
    if (!projectId || !fileId) return false;

    const contentToUse = contentToSave !== undefined ? contentToSave : content;

    try {
      setIsSaving(true);

      const response = await fetch(`/api/projects/${projectId}/files/${fileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToUse }),
      });

      if (!response.ok) {
        throw new Error('Failed to save document');
      }

      const data = await response.json();
      setDocumentData(data.document);
      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('Error saving document:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompile = async () => {
    if (compiling) return;

    setCompiling(true);

    try {
      // Get the current content from the editor
      const currentContent = editorRef.current?.getValue() || content;
      
      console.log('Compiling content, length:', currentContent.length);
      console.log('Content preview:', currentContent.substring(0, 200) + '...');
      
      // Save the document first
      await saveDocument(currentContent);

      const response = await fetch('/api/compile-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentContent }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Compilation failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.pdf) {
        console.log('PDF generated successfully, size:', data.size);
        setPdfData(data.pdf);
        setCompilationError(null); // Clear any previous errors
      } else {
        throw new Error('No PDF data received');
      }
    } catch (error) {
      console.error('Compilation error:', error);
      
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

  const handleEditSuggestion = (suggestion: EditSuggestion | string) => {
    if (typeof suggestion === 'string') {
      try {
        const parsed = JSON.parse(suggestion);
        setEditSuggestions((prev) => [...prev, parsed]);
      } catch (error) {
        console.error('Failed to parse suggestion:', error);
      }
    } else {
      setEditSuggestions((prev) => [...prev, suggestion]);
    }
  };

  const handleNextSuggestion = () => {
    if (suggestionQueueRef.current.length > 0) {
      const nextSuggestion = suggestionQueueRef.current.shift();
      if (nextSuggestion) {
        handleEditSuggestion(nextSuggestion);
      }
    }
  };

  const handleAcceptEdit = (suggestionId: string) => {
    const suggestion = editSuggestions.find((s) => s.id === suggestionId);
    if (!suggestion || !editorRef.current) return;

    try {
      const editor = editorRef.current;
      const model = editor.getModel();
      if (!model) return;

      const startLineNumber = suggestion.startLine;
      const endLineNumber = suggestion.startLine + suggestion.originalLineCount - 1;

      // Get the range for the original text
      const startColumn = 1;
      const endColumn = model.getLineMaxColumn(endLineNumber);

      // Create range using the editor's range constructor
      const rangeToReplace = {
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn,
      };

      console.log('Applying suggestion:', {
        suggestionId,
        startLineNumber,
        endLineNumber,
        original: suggestion.original,
        suggested: suggestion.suggested,
        range: rangeToReplace
      });

      // Apply the suggested text
      editor.executeEdits('accept-suggestion', [
        {
          range: rangeToReplace,
          text: suggestion.suggested,
          forceMoveMarkers: true,
        },
      ]);

      // Get the updated content from the editor
      const updatedContent = editor.getValue();
      
      console.log('Content updated, new length:', updatedContent.length);
      
      // Update content state
      setContent(updatedContent);

      // Save the document with the new content
      saveDocument(updatedContent).then((saved) => {
        console.log('Document saved:', saved);
        if (saved) {
          // Trigger compilation with the updated content
          console.log('Triggering compilation...');
          handleCompile();
        }
      });

      // Remove the suggestion from the list
      setEditSuggestions((prev) =>
        prev.filter((s) => s.id !== suggestionId)
      );

      // Process next suggestion if available
      setTimeout(handleNextSuggestion, 0);
    } catch (error) {
      console.error('Error applying edit:', error);
    }
  };

  const handleRejectEdit = (suggestionId: string) => {
    setEditSuggestions((prev) =>
      prev.filter((s) => s.id !== suggestionId)
    );
    setTimeout(handleNextSuggestion, 0);
  };

  function handleCopy(textToCopy?: string) {
    const currentSelectedText = textToCopy ?? selectedText;
    console.log('handleCopy called with:', { currentSelectedText, textToCopy, selectedText });

    if (currentSelectedText.trim()) {
      setTextFromEditor(currentSelectedText);
      setShowButton(false);
      setChatOpen(true);
    }
  }

  const debouncedCursorSelection = useDebouncedCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor) => {
      const selection = editor.getSelection();
      const model = editor.getModel();
      const text = model?.getValueInRange(selection!);

      console.log('Selection changed:', { selection, text, isEmpty: selection?.isEmpty() });

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

        console.log('Setting button position:', { startCoords, text });

        if (startCoords) {
          setButtonPos({
            top: startCoords.top - 30,
            left: startCoords.left,
          });
          setSelectedText(text);
          setShowButton(true);
        }
      } else {
        console.log('Hiding button');
        setShowButton(false);
        setSelectedText('');
      }
    },
    200
  );

  const handleExportPDF = async () => {
    setExportingPDF(true);

    try {
      const currentContent = editorRef.current?.getValue() || content;

      const response = await fetch('/api/compile-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentContent }),
      });

      if (!response.ok) throw new Error('PDF compilation failed');

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
        a.download = `${file?.name || 'document'}.pdf`;
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

  const handleTextFormat = (format: 'bold' | 'italic' | 'underline') => {
    const editor = editorRef.current;
    if (!editor) return;

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

    editor.focus();
  };

  const handleEditorDidMount = (
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco
  ) => {
    editorRef.current = editor;

    // Add selection change listener for floating button
    editor.onDidChangeCursorSelection((e) => {

    // Auto-compile on content changes
    editor.onDidChangeModelContent(() => {
      const currentContent = editor.getValue();
      debouncedAutoCompile(currentContent);
    });      debouncedCursorSelection(editor);
    });

    // Add keyboard shortcuts
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
          e.preventDefault();
          e.stopPropagation();
          
          const currentContent = editor.getValue();
          saveDocument(currentContent).then((saved) => {
            if (saved) handleCompile();
          });
          
          return false;
        }
        
        if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
          e.preventDefault();
          e.stopPropagation();
          
          // Get selected text from editor
          const selection = editor.getSelection();
          if (selection && !selection.isEmpty()) {
            const model = editor.getModel();
            if (model) {
              const selectedText = model.getValueInRange(selection);
              setTextFromEditor(selectedText);
            }
          } else {
            // Clear textFromEditor if no selection
            setTextFromEditor(null);
          }
          
          setChatOpen((prev) => !prev);
          
          return false;
        }
      });
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => router.push('/projects')}>
            Back to Projects
          </Button>
        </div>
      </main>
    );
  }

  if (!project || !documentData || !file) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">Project or file not found</p>
          <Button variant="outline" onClick={() => router.push('/projects')}>
            Back to Projects
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-30 flex-shrink-0 px-2 py-0 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between ">
          <ButtonGroup>
            <ButtonGroupItem onClick={() => handleTextFormat('bold')} className="px-2 py-1 text-xs">
              <span className="text-xs font-bold">B</span>
            </ButtonGroupItem>
            <ButtonGroupItem onClick={() => handleTextFormat('italic')} className="px-2 py-1 text-xs">
              <span className="text-xs italic">I</span>
            </ButtonGroupItem>
            <ButtonGroupItem onClick={() => handleTextFormat('underline')} className="px-2 py-1 text-xs">
              <span className="text-xs underline">U</span>
            </ButtonGroupItem>
          </ButtonGroup>

          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-slate-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {isSaving && (
              <span className="text-xs text-blue-500">
                <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                Saving...
              </span>
            )}
            <Button
              variant="ghost"
              size="xs"
              onClick={handleCompile}
              disabled={compiling}
            >
              {compiling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Compiling
                </>
              ) : (
                <>
                  Compile
                  <span className="ml-1 text-xs opacity-60">⌘S</span>
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
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Exporting
                </>
              ) : (
                'Export'
              )}
            </Button>
            <UsageIndicator />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Editor */}
        <div className="flex-1 relative overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="latex"
            value={content}
            onChange={(value) => {
              const newContent = value || '';
              setContent(newContent);
              debouncedSave(newContent);
            }}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: 'on',
              lineNumbers: 'on',
            }}
            onMount={handleEditorDidMount}
          />

          {/* Floating Edit Button */}
          {showButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Edit button clicked');
                handleCopy();
              }}
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
                    <div className="text-sm space-y-2">
                      <div className="text-red-600 line-through whitespace-pre-wrap break-words">
                        {suggestion.original}
                      </div>
                      <div className="text-green-600 font-medium whitespace-pre-wrap break-words">
                        {suggestion.suggested}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAcceptEdit(suggestion.id)}
                      className="flex-1 border border-green-200 text-green-700 hover:border-green-300 hover:bg-green-50"
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRejectEdit(suggestion.id)}
                      className="flex-1 border border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="w-1/2 border-l border-slate-200 overflow-hidden">
          <PDFViewer pdfData={pdfData} isLoading={compiling} />
        </div>
      </div>

      {/* Chat component */}
      <Chat
        isOpen={chatOpen}
        setIsOpen={setChatOpen}
        onEditSuggestion={(suggestionArray) => {
          // Always expect an array of stringified suggestions
          if (Array.isArray(suggestionArray)) {
            const [first, ...rest] = suggestionArray;
            handleEditSuggestion(first);
            suggestionQueueRef.current = rest.map(s => typeof s === 'string' ? JSON.parse(s) : s);
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
      
      {/* Compilation Error Display */}
      {compilationError && (
        <CompilationError
          error={compilationError}
          onRetry={handleCompile}
          onDismiss={() => setCompilationError(null)}
        />
      )}
    </div>
  );
} 