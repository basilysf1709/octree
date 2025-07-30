'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, FileText, Download, Edit } from 'lucide-react';
import Link from 'next/link';
import Editor, { loader } from '@monaco-editor/react';
import {
  latexLanguageConfiguration,
  latexTokenProvider,
  registerLatexCompletions,
} from '@/lib/editor-config';
import type * as Monaco from 'monaco-editor';

interface File {
  id: string;
  name: string;
  project_id: string;
  size: number | null;
  type: string | null;
  uploaded_at: string | null;
}

interface Project {
  id: string;
  title: string;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export default function FileViewerPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const projectId = params.projectId as string;
  const fileId = params.fileId as string;
  
  const [file, setFile] = useState<File | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<typeof Monaco | null>(null);

  // Initialize Monaco editor
  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.languages.register({ id: 'latex' });
      monaco.languages.setLanguageConfiguration(
        'latex',
        latexLanguageConfiguration
      );
      monaco.languages.setMonarchTokensProvider('latex', latexTokenProvider);
      registerLatexCompletions(monaco);
      setMonacoInstance(monaco);
    });
  }, []);

  useEffect(() => {
    const fetchFileAndProject = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/auth/login');
          return;
        }

        // Fetch the file
        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .select('*')
          .eq('id', fileId)
          .eq('project_id', projectId)
          .single();

        if (fileError) {
          throw new Error('File not found');
        }

        setFile(fileData);

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

        // Check if this file is associated with a document
        const isLatexFile = fileData.name.toLowerCase().endsWith('.tex');
        
        if (isLatexFile) {
          // Try to find a document linked to this project with the same filename
          const { data: documentData, error: documentError } = await supabase
            .from('documents')
            .select('*')
            .eq('project_id', projectId)
            .eq('filename', fileData.name)
            .eq('owner_id', session.user.id)
            .single();

          if (documentData && !documentError) {
            setDocument(documentData);
            setFileContent(documentData.content);
          } else {
            // Try to find a document with the same title (without .tex extension)
            const documentTitle = fileData.name.replace(/\.tex$/i, '');
            const { data: documentData2, error: documentError2 } = await supabase
              .from('documents')
              .select('*')
              .eq('title', documentTitle)
              .eq('owner_id', session.user.id)
              .single();

            if (documentData2 && !documentError2) {
              setDocument(documentData2);
              setFileContent(documentData2.content);
            } else {
              // Create a placeholder content for .tex files
              setFileContent(`\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}

\\title{${documentTitle}}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
This is a LaTeX document for ${documentTitle}.

\\end{document}`);
            }
          }
        } else {
          // For non-LaTeX files, show file metadata
          setFileContent(`// File: ${fileData.name}
// Project: ${projectData.title}
// Size: ${fileData.size || 'Unknown'} bytes
// Type: ${fileData.type || 'Unknown'}

// File content would be loaded here in a real implementation.
// This file type (${fileData.type || 'unknown'}) is not currently supported for editing.`);
        }

      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId && fileId) {
      fetchFileAndProject();
    }
  }, [projectId, fileId, supabase, router]);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditorDidMount = (
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco
  ) => {
    setEditor(editor);
    setMonacoInstance(monaco);
  };

  const isLatexFile = file?.name.toLowerCase().endsWith('.tex');

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
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Link href="/projects">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  if (!file || !project) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">File not found</p>
          <Link href="/projects">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-neutral-500">
          <Link href="/projects" className="hover:text-neutral-700">
            Projects
          </Link>
          <span>/</span>
          <Link href={`/projects/${project.id}`} className="hover:text-neutral-700">
            {project.title}
          </Link>
          <span>/</span>
          <span className="text-neutral-900">{file.name}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{file.name}</h1>
            <p className="text-sm text-neutral-500">
              File in {project.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isLatexFile && document && (
              <Link href={`/editor/${document.id}`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Document
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Link href="/projects">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* File Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {isLatexFile ? 'LaTeX Document' : 'File Content'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLatexFile ? (
                <div className="h-96">
                  <Editor
                    height="100%"
                    defaultLanguage="latex"
                    value={fileContent || ''}
                    onMount={handleEditorDidMount}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                    }}
                  />
                </div>
              ) : (
                <div className="bg-neutral-50 rounded-lg p-4 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{fileContent}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* File Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>File Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700">Name</label>
                <p className="text-sm text-neutral-900">{file.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Type</label>
                <p className="text-sm text-neutral-900">{file.type || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Size</label>
                <p className="text-sm text-neutral-900">{formatFileSize(file.size)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Uploaded</label>
                <p className="text-sm text-neutral-900">{formatDate(file.uploaded_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Project</label>
                <p className="text-sm text-neutral-900">{project.title}</p>
              </div>
              {document && (
                <div>
                  <label className="text-sm font-medium text-neutral-700">Document</label>
                  <p className="text-sm text-neutral-900">
                    <Link href={`/editor/${document.id}`} className="text-blue-600 hover:underline">
                      {document.title}
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} 