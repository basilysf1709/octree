'use client';

import { useEffect, useState, useRef } from 'react';
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

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

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  // Debounced auto-save function
  const debouncedSave = useDebouncedCallback(
    (content: string) => {
      saveDocument(content);
    },
    2000 // Save after 2 seconds of inactivity
  );

  // Initialize Monaco
  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.languages.register({ id: 'latex' });
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
      // Save the document first
      await saveDocument();

      const response = await fetch('/api/compile-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Compilation failed with status ${response.status}`);
      }

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

    // Add keyboard shortcut for save (Cmd+S / Ctrl+S)
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
          e.preventDefault();
          e.stopPropagation();
          
          const currentContent = editor.getValue();
          saveDocument(currentContent);
          
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
            {/* Header */}
      <div className="flex-shrink-0 p-2 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/projects/${projectId}`}>
                  {project.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{file.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

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
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0 p-2 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
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
            <Button
              variant="ghost"
              size="sm"
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
              size="sm"
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
        </div>

        {/* PDF Viewer */}
        <div className="w-1/2 border-l border-slate-200 overflow-hidden">
          <PDFViewer pdfData={pdfData} isLoading={compiling} />
        </div>
      </div>
    </div>
  );
} 