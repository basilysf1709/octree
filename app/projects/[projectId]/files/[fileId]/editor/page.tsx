'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { loader } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import {
  latexLanguageConfiguration,
  latexTokenProvider,
  registerLatexCompletions,
} from '@/lib/editor-config';
import { EditSuggestion } from '@/types/edit';

import { useFileEditor } from '@/hooks/use-file-editor';
import { useEditorState } from '@/hooks/use-editor-state';
import { useDocumentSave } from '@/hooks/use-document-save';
import { useEditorCompilation } from '@/hooks/use-editor-compilation';
import { useEditSuggestions } from '@/hooks/use-edit-suggestions';
import { useEditorKeyboardShortcuts } from '@/hooks/use-editor-keyboard-shortcuts';
import { useTextFormatting } from '@/hooks/use-text-formatting';
import { useEditorInteractions } from '@/hooks/use-editor-interactions';

import { EditorToolbar } from '@/components/editor/toolbar';
import { MonacoEditor } from '@/components/editor/monaco-editor';
import { SelectionButton } from '@/components/editor/selection-button';
import { SuggestionActions } from '@/components/editor/suggestion-actions';
import { LoadingState } from '@/components/editor/loading-state';
import { ErrorState } from '@/components/editor/error-state';
import PDFViewer from '@/components/pdf-viewer';
import { Chat } from '@/components/chat';
import { CompilationError } from '@/components/latex/compilation-error';
import { LimitReachedDialog } from '@/components/editor/limit-reached-dialog';

export default function FileEditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const fileId = params.fileId as string;

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const suggestionQueueRef = useRef<EditSuggestion[]>([]);

  const { project, file, documentData, isLoading, error } = useFileEditor();

  const { content, setContent } = useEditorState(documentData?.content || '');

  const { isSaving, lastSaved, handleSaveDocument, debouncedSave } =
    useDocumentSave({
      projectId,
      fileId,
      content,
    });

  const {
    compiling,
    pdfData,
    compilationError,
    exportingPDF,
    handleCompile,
    handleExportPDF,
    debouncedAutoCompile,
    setCompilationError,
  } = useEditorCompilation({
    content,
    saveDocument: handleSaveDocument,
    editorRef,
    fileName: file?.name,
  });

  const {
    editSuggestions,
    handleEditSuggestion,
    handleAcceptEdit,
    handleRejectEdit,
    handleNextSuggestion,
  } = useEditSuggestions({
    editor: editorRef.current,
    monacoInstance: monacoRef.current,
  });

  const { handleTextFormat } = useTextFormatting({ editorRef });

  const {
    showButton,
    buttonPos,
    selectedText,
    textFromEditor,
    chatOpen,
    setChatOpen,
    setTextFromEditor,
    handleCopy,
    setupEditorListeners,
  } = useEditorInteractions();

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

  useEffect(() => {
    if (documentData?.content !== undefined) {
      setContent(documentData.content);
    }
  }, [documentData?.content, setContent]);

  const handleEditorChange = useCallback(
    (value: string) => {
      setContent(value);
      debouncedSave(value);
      debouncedAutoCompile(value);
    },
    [setContent, debouncedSave, debouncedAutoCompile]
  );

  const handleSuggestionFromChat = useCallback(
    (
      suggestionArray: EditSuggestion | string | (string | EditSuggestion)[]
    ) => {
      if (Array.isArray(suggestionArray)) {
        const [first, ...rest] = suggestionArray;
        handleEditSuggestion(first);
        suggestionQueueRef.current = rest.map((suggestion) =>
          typeof suggestion === 'string'
            ? (JSON.parse(suggestion) as EditSuggestion)
            : suggestion
        );
      } else {
        handleEditSuggestion(suggestionArray);
        suggestionQueueRef.current = [];
      }
    },
    [handleEditSuggestion]
  );

  const handleAcceptEditWithQueue = useCallback(
    async (suggestionId: string) => {
      await handleAcceptEdit(suggestionId);
      setTimeout(handleNextSuggestion, 0);
    },
    [handleAcceptEdit, handleNextSuggestion]
  );

  const handleRejectEditWithQueue = useCallback(
    (suggestionId: string) => {
      handleRejectEdit(suggestionId);
      setTimeout(handleNextSuggestion, 0);
    },
    [handleRejectEdit, handleNextSuggestion]
  );

  useEditorKeyboardShortcuts({
    editor: editorRef.current,
    monacoInstance: monacoRef.current,
    onSave: () => handleSaveDocument().then(() => handleCompile()),
    onCopy: () => {
      if (selectedText.trim()) {
        setTextFromEditor(selectedText);
        setChatOpen(true);
      }
    },
    onTextFormat: handleTextFormat,
  });

  const handleEditorMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      setupEditorListeners(editor);

      editor.onDidChangeModelContent(() => {
        const currentContent = editor.getValue();
        debouncedAutoCompile(currentContent);
      });
    },
    [setupEditorListeners, debouncedAutoCompile]
  );

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!project || !documentData || !file)
    return <ErrorState error="Project or file not found" />;

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <EditorToolbar
        onTextFormat={handleTextFormat}
        onCompile={handleCompile}
        onExportPDF={handleExportPDF}
        compiling={compiling}
        exportingPDF={exportingPDF}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />

      <div className="flex min-h-0 flex-1">
        <div className="relative flex-1 overflow-hidden">
          <MonacoEditor
            content={content}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            className="h-full"
          />
          <SelectionButton
            show={showButton}
            position={buttonPos}
            onCopy={() => handleCopy()}
          />
          <SuggestionActions
            suggestions={editSuggestions}
            onAccept={handleAcceptEditWithQueue}
            onReject={handleRejectEditWithQueue}
          />
        </div>

        <div className="w-1/2 overflow-hidden border-l border-slate-200">
          <PDFViewer pdfData={pdfData} isLoading={compiling} />
        </div>
      </div>

      <Chat
        isOpen={chatOpen}
        setIsOpen={setChatOpen}
        onEditSuggestion={handleSuggestionFromChat}
        fileContent={content}
        textFromEditor={textFromEditor}
        setTextFromEditor={setTextFromEditor}
      />

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
