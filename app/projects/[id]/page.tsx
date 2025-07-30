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
import type { EditSuggestion } from '@/types/edit';
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

export default function ProjectEditorPage() {
  // Add Supabase client and params
  const supabase = createClient();
  const params = useParams();
  const projectId = params.id as string;

  // Add project metadata state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [buttonPos, setButtonPos] = useState({ top: 0, left: 0 });
  const [showButton, setShowButton] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [textFromEditor, setTextFromEditor] = useState<string | null>(null);

  // Add title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');

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
  const suggestionQueueRef = useRef<EditSuggestion[]>([]);
  const [editor, setEditor] =
    useState<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<typeof Monaco | null>(
    null
  );
  const [decorationIds, setDecorationIds] = useState<string[]>([]);
  const [exportingPDF, setExportingPDF] = useState(false);

  // Keep track of whether we've attempted initial compilation
  const initialCompileRef = useRef(false);

  // Load project and main.tex file on initial render and compile once after loading
  useEffect(() => {
    const fetchProjectAndFile = async () => {
      if (!projectId) return;
      try {
        // First, get the project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('title')
          .eq('id', projectId)
          .single();
        
        if (projectError) throw projectError;
        if (projectData) {
          setTitle(projectData.title || '');
        }

        // Then, get the main.tex file content from storage
        const { data: fileData, error: fileError } = await supabase.storage
          .from('octree')
          .download(`projects/${projectId}/main.tex`);

        if (fileError) {
          console.error('Error fetching main.tex:', fileError);
          // If file doesn't exist, use initial content
          setContent(initialContent);
        } else {
          // Convert blob to text
          const text = await fileData.text();
          setContent(text);
        }

        setLastSaved(new Date());
        
        // Schedule compilation after state updates have been applied
        setTimeout(() => {
          if (!initialCompileRef.current && !compiling) {
            initialCompileRef.current = true;
            handleCompile(content);
          }
        }, 500);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };
    fetchProjectAndFile();
  }, [projectId, supabase]);

  // Function to save project title to database
  const saveTitle = async (newTitle: string): Promise<boolean> => {
    if (!projectId) return false;
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: newTitle,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);
      if (error) throw error;
      setTitle(newTitle);
      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('Error saving title:', error);
      return false;
    }
  };

  // Function to handle title editing
  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setEditingTitle(title);
  };

  // Function to save title changes
  const handleTitleSave = async () => {
    if (editingTitle.trim() && editingTitle !== title) {
      const success = await saveTitle(editingTitle.trim());
      if (!success) {
        // Revert to original title if save failed
        setEditingTitle(title);
      }
    }
    setIsEditingTitle(false);
  };

  // Function to cancel title editing
  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditingTitle(title);
  };

  // Handle Enter and Escape keys for title editing
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleTitleCancel();
    }
  };

  // Simplified handleCompile function
  const handleCompile = async (contentToCompile?: string) => {
    if (compiling) {
      return;
    }
    // Use provided content or fall back to state
    const contentToUse =
      contentToCompile !== undefined ? contentToCompile : content;
    setCompiling(true);
    try {
      // Save the file first
      await saveFile(contentToUse);
      // Then compile
      const response = await fetch('/api/compile-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToUse }),
      });
      if (!response.ok) {
        throw new Error(`Compilation failed with status ${response.status}`);
      }
      const data = await response.json();
      if (data.pdf) {
        setPdfData(data.pdf);
      } else {
        console.error('[ProjectEditorPage] No PDF data in response');
        throw new Error('No PDF data received');
      }
    } catch (error) {
      console.error('[ProjectEditorPage] Compilation error:', error);
    } finally {
      setCompiling(false);
    }
  };

  // New function to save file to storage
  const saveFile = async (contentToSave?: string): Promise<boolean> => {
    if (!projectId) return false;
    // Use provided content or fall back to state
    const contentToUse = contentToSave !== undefined ? contentToSave : content;
    try {
      setIsSaving(true);
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('octree')
        .upload(
          `projects/${projectId}/main.tex`,
          new Blob([contentToUse], { type: 'text/plain' }),
          { upsert: true }
        );

      if (uploadError) throw uploadError;
      
      // Update state if we used a different content
      if (contentToSave !== undefined && contentToSave !== content) {
        setContent(contentToSave);
      }
      setLastSaved(new Date());
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
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
      // Get the latest content
      const currentContent = editor?.getValue() || content;
      // Save file in the background
      const savePromise = saveFile(currentContent);
      const response = await fetch('/api/compile-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentContent }),
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
        a.download = `${title || 'document'}.pdf`;
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

  const handleEditSuggestion = (suggestion: EditSuggestion | string) => {
    // Accept both object and stringified suggestion
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
      setTimeout(handleNextSuggestion, 0);
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
    const { command, length } = formatMap[format]; // Fixed undeclared variable error

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
          saveFile(currentContent).then((saved) => {
            if (saved) handleCompile(currentContent);
          });
          return false;
        }
      });
    }

    // Configure suggestion actions
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
      debouncedCursorSelection(editor);
    });

    // Original Cmd+B command for text selection remains
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB,
      () => {
        const currentEditor = editorRef.current;
        if (!currentEditor) {
          console.error('[ProjectEditorPage] Cmd+B Error: editorRef is not set.');
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
    <div className="flex h-screen flex-col bg-slate-100">
      {/* Top bar: Breadcrumb, Save Status, Format Buttons, Compile/Export */}
      <div className="flex-shrink-0 px-4 py-2">
        <div className="relative flex justify-end gap-1 py-1">
          <Breadcrumb className="absolute top-1 left-1/2 -translate-x-1/2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    onBlur={handleTitleSave}
                    className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 min-w-[200px] px-2 py-1 rounded border border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <BreadcrumbPage 
                    className="cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={handleTitleEdit}
                  >
                    {title}
                  </BreadcrumbPage>
                )}
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
                size="sm"
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
                size="sm"
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
      </div>

      {/* Main content area: Editor and PDF Viewer */}
      <div className="flex flex-1 gap-4 px-4 pb-4 min-h-0">
        <div className="relative flex-4 overflow-hidden rounded-md bg-white shadow-sm min-h-0">
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
          {/* Enhanced Suggestion Actions with Diff View */}
          <div className="absolute top-1 right-3 z-50 max-w-[400px] space-y-2">
            {editSuggestions
              .filter((s) => s.status === 'pending')
              .map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-white p-4 shadow-xl backdrop-blur-sm"
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
                  <DiffViewer
                    original={suggestion.original}
                    suggested={suggestion.suggested}
                    className="max-w-full"
                  />
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
        <div className="flex-3 overflow-hidden rounded-md bg-white shadow-sm min-h-0">
          <PDFViewer pdfData={pdfData} isLoading={compiling} />
        </div>
      </div>

      {/* Add Chat component */}
      <Chat
        isOpen={chatOpen}
        setIsOpen={setChatOpen}
        onEditSuggestion={(suggestionArray) => {
          // Always expect an array of stringified suggestions
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
