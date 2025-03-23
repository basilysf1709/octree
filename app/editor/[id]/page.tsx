'use client';

import { useEffect, useState } from 'react';
import Editor, { loader } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { latexLanguageConfiguration, latexTokenProvider } from '@/lib/editor-config';

// Configure Monaco editor
loader.init().then(monaco => {
  monaco.languages.register({ id: 'latex' });
  monaco.languages.setLanguageConfiguration('latex', latexLanguageConfiguration);
  monaco.languages.setMonarchTokensProvider('latex', latexTokenProvider);
});

export default function EditorPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState(`\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{graphicx}

\\title{My Document}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
This is a sample LaTeX document.

\\section{Mathematics}
Here's a simple equation:
\\[
  E = mc^2
\\]

\\end{document}`);
  
  const [compiling, setCompiling] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const config = {
    loader: { load: ["[tex]/html"] },
    tex: {
      packages: { "[+]": ["html"] },
      inlineMath: [["$", "$"]],
      displayMath: [["$$", "$$"]],
    },
  };

  const extractContent = (latex: string) => {
    // Extract content between \begin{document} and \end{document}
    const match = latex.match(/\\begin{document}([\s\S]*?)\\end{document}/);
    if (!match) return latex;
    
    return match[1]
      // Handle sections
      .replace(/\\section{(.*?)}/g, '<h2>$1</h2>')
      .replace(/\\subsection{(.*?)}/g, '<h3>$1</h3>')
      // Handle title, author, date
      .replace(/\\maketitle/, (match) => {
        const title = latex.match(/\\title{(.*?)}/)?.[1] || '';
        const author = latex.match(/\\author{(.*?)}/)?.[1] || '';
        const date = latex.match(/\\date{(.*?)}/)?.[1] || '';
        return `<h1>${title}</h1><p><em>${author}</em></p><p>${date}</p>`;
      })
      // Handle math environments
      .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$')
      .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$');
  };

  const handleCompile = async () => {
    setCompiling(true);
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Compilation failed');

      const { html } = await response.json();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Compilation error:', error);
    } finally {
      setCompiling(false);
    }
  };

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-blue-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z" />
                </svg>
                <span className="text-xl font-bold text-blue-900">Octree</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleCompile}
                disabled={compiling}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {compiling ? 'Compiling...' : 'Compile'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Editor */}
          <div className="flex-1 bg-white rounded-lg shadow-sm">
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
              }}
            />
          </div>

          {/* Preview */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-4 overflow-auto">
            {compiling ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-[80vh]"
                title="Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-blue-600">
                Click &quot;Compile&quot; to see the preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 