'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useEditorState } from '@/hooks/use-editor-state';
import { useDocumentOperations } from '@/hooks/use-document-operations';
import { useEditSuggestions } from '@/hooks/use-edit-suggestions';
import { useEditorSelection } from '@/hooks/use-editor-selection';
import { useEditorKeyboardShortcuts } from '@/hooks/use-editor-keyboard-shortcuts';

import { EditorHeader } from '@/components/editor/header';
import { EditorToolbar } from '@/components/editor/toolbar';
import { MonacoEditor } from '@/components/editor/monaco-editor';
import { SelectionButton } from '@/components/editor/selection-button';
import { SuggestionActions } from '@/components/editor/suggestion-actions';
import { Chat } from '@/components/chat';
import PDFViewer from '@/components/pdf-viewer';

import { fetchProjectAndDocument } from '@/actions/fetch-project-document';
import { initialContent } from '@/lib/utils';

export default function ProjectEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const editorState = useEditorState(initialContent);
  const documentOps = useDocumentOperations({
    projectId,
    content: editorState.content,
    editor: editorState.editor,
  });
  const suggestions = useEditSuggestions({
    editor: editorState.editor,
    monacoInstance: editorState.monacoInstance,
  });
  const selection = useEditorSelection({
    onTextSelected: (text) => setTextFromEditor(text),
  });

  const [project, setProject] = useState<{ id: string; title: string } | null>(
    null
  );
  const [document, setDocument] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [textFromEditor, setTextFromEditor] = useState<string | null>(null);

  useEffect(() => {
    const loadProjectAndDocument = async () => {
      if (!projectId) return;

      try {
        const result = await fetchProjectAndDocument(projectId);

        if (result.error) {
          console.error('Error loading project:', result.error);
          if (result.error === 'User not authenticated') {
            router.push('/auth/login');
            return;
          }
          router.push('/projects');
          return;
        }

        if (!result.data) {
          router.push('/projects');
          return;
        }

        const { project: projectData, document: documentData } = result.data;

        setProject(projectData);
        setDocument(documentData);
        editorState.setContent(documentData.content);
        documentOps.setLastSaved(new Date());

        setTimeout(() => {
          documentOps.handleCompile(documentData?.content || initialContent);
        }, 500);

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading project:', error);
        router.push('/projects');
      }
    };

    loadProjectAndDocument();
  }, [projectId, router, editorState, documentOps]);

  useEditorKeyboardShortcuts({
    editor: editorState.editor,
    monacoInstance: editorState.monacoInstance,
    onSave: (content) => {
      documentOps.handleSaveDocument(content).then((saved) => {
        if (saved) documentOps.handleCompile(content);
      });
    },
    onCopy: selection.handleCopy,
  });

  const handleTextFormat = (format: 'bold' | 'italic' | 'underline') => {
    const editor = editorState.editorRef.current;
    const monaco = editorState.monacoInstance;
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

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </main>
    );
  }

  if (!project || !document) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="mb-4 text-neutral-600">Project or document not found</p>
          <Button variant="outline" onClick={() => router.push('/projects')}>
            Back to Dashboard
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <EditorHeader
        projectTitle={project.title}
        lastSaved={documentOps.lastSaved}
      />

      <EditorToolbar
        onTextFormat={handleTextFormat}
        onCompile={() => documentOps.handleCompile()}
        onExportPDF={documentOps.handleExportPDF}
        compiling={documentOps.compiling}
        exportingPDF={documentOps.exportingPDF}
        isSaving={documentOps.isSaving}
      />

      <div className="flex min-h-0 flex-1">
        <div className="relative flex-1 overflow-hidden">
          <MonacoEditor
            content={editorState.content}
            onChange={(value) => {
              editorState.setContent(value);
              documentOps.debouncedAutoCompile(value);
            }}
            onMount={(editor, monaco) => {
              editorState.setEditor(editor);
              editorState.setMonacoInstance(monaco);
              editorState.editorRef.current = editor;
              selection.setupSelectionHandling(editor);
            }}
          />

          <SelectionButton
            show={selection.showButton}
            position={selection.buttonPos}
            onCopy={selection.handleCopy}
          />

          <SuggestionActions
            suggestions={suggestions.editSuggestions}
            onAccept={suggestions.handleAcceptEdit}
            onReject={suggestions.handleRejectEdit}
          />
        </div>

        <div className="w-1/2 overflow-hidden border-l border-slate-200">
          <PDFViewer
            pdfData={documentOps.pdfData}
            isLoading={documentOps.compiling}
          />
        </div>
      </div>

      <Chat
        isOpen={chatOpen}
        setIsOpen={setChatOpen}
        onEditSuggestion={(suggestionArray) => {
          if (Array.isArray(suggestionArray)) {
            const [first, ...rest] = suggestionArray;
            suggestions.handleEditSuggestion(first);
            suggestions.suggestionQueueRef.current = rest.map((s) =>
              typeof s === 'string' ? JSON.parse(s) : s
            );
          } else {
            suggestions.handleEditSuggestion(suggestionArray);
            suggestions.suggestionQueueRef.current = [];
          }
        }}
        fileContent={editorState.content}
        textFromEditor={textFromEditor}
        setTextFromEditor={setTextFromEditor}
      />
    </div>
  );
}
