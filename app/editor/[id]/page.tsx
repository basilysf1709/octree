'use client';

import { useEffect, useState } from 'react';
import Editor, { loader } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { latexLanguageConfiguration, latexTokenProvider, registerLatexCompletions } from '@/lib/editor-config';
import { Chat } from '@/components/chat';
import { OctreeLogo } from '@/components/icons/octree-logo';
import { EditSuggestion } from '@/types/edit';
import { Check, X } from 'lucide-react';
import type * as Monaco from 'monaco-editor';

export default function EditorPage({ params }: { params: { id: string } }) {
  // Move Monaco initialization into useEffect
  useEffect(() => {
    loader.init().then(monaco => {
      monaco.languages.register({ id: 'latex' });
      monaco.languages.setLanguageConfiguration('latex', latexLanguageConfiguration);
      monaco.languages.setMonarchTokensProvider('latex', latexTokenProvider);
      registerLatexCompletions(monaco);
    });
  }, []); // Empty dependency array means this runs once on mount

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
  E = mc^2

\\end{document}`);
  
  const [compiling, setCompiling] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [editSuggestions, setEditSuggestions] = useState<EditSuggestion[]>([]);
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<typeof Monaco | null>(null);
  const [decorationIds, setDecorationIds] = useState<string[]>([]);

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

  const handleEditSuggestion = (suggestion: EditSuggestion) => {
    setEditSuggestions(prev => [...prev, suggestion]);
  };

  const handleAcceptEdit = (id: string) => {
    const suggestion = editSuggestions.find(s => s.id === id);
    if (!suggestion || !editor || !monacoInstance) return;

    const model = editor.getModel();
    if (!model) return;

    const range = new monacoInstance.Range(
      suggestion.startLine,
      1,
      suggestion.endLine + 1,
      1
    );

    const currentText = model.getValueInRange(range);
    
    if (currentText.trim() === suggestion.original.trim()) {
      editor.executeEdits('suggestion', [{
        range,
        text: suggestion.suggested + '\n',
        forceMoveMarkers: true
      }]);

      setContent(editor.getValue());
    }

    // Update suggestion status
    setEditSuggestions(prev =>
      prev.map(s => s.id === id ? { ...s, status: 'accepted' } : s)
    );
  };

  const handleRejectEdit = (id: string) => {
    setEditSuggestions(prev =>
      prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s)
    );
  };

  // Update the decoration effect
  useEffect(() => {
    if (!editor || !monacoInstance) return;

    const model = editor.getModel();
    if (!model) return;

    // Clear previous decorations
    editor.deltaDecorations(decorationIds, []);

    const decorations = editSuggestions
      .filter(s => s.status === 'pending')
      .map(suggestion => ({
        range: new monacoInstance.Range(
          suggestion.startLine,
          1,
          suggestion.endLine + 1,
          1
        ),
        options: {
          isWholeLine: true,
          className: 'suggestion-line',
          glyphMarginClassName: 'suggestion-glyph',
          glyphMarginHoverMessage: { value: 'Edit suggestion' },
          minimap: {
            color: '#34d399',
            position: 2
          },
          after: {
            content: '  ',
            inlineClassName: 'after-suggestion',
            attachedData: suggestion.id
          }
        }
      }));

    // Store new decoration IDs
    const newDecorationIds = editor.deltaDecorations([], decorations);
    setDecorationIds(newDecorationIds);
  }, [editSuggestions, editor, monacoInstance]);

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
                <OctreeLogo className="w-8 h-8 text-blue-600" />
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
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: 'allDocuments',
                tabCompletion: 'on',
                suggest: {
                  snippetsPreventQuickSuggestions: false,
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
                    
                    const decorations = ed.getLineDecorations(position.lineNumber);
                    const suggestion = decorations?.find(d => d.options.after?.attachedData);
                    if (suggestion) {
                      handleAcceptEdit(suggestion.options.after.attachedData);
                    }
                  }
                });
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

      {/* Add Chat component */}
      <Chat 
        onEditSuggestion={handleEditSuggestion} 
        fileContent={content}
      />

      {/* Suggestion Actions */}
      <div className="fixed right-6 top-24 space-y-2 z-50">
        {editSuggestions
          .filter(s => s.status === 'pending')
          .map(suggestion => (
            <div
              key={suggestion.id}
              className="flex flex-col gap-2 p-3 bg-white shadow-lg rounded-lg border border-blue-100"
            >
              <div className="text-sm text-blue-600">
                Lines {suggestion.startLine}-{suggestion.endLine}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAcceptEdit(suggestion.id)}
                  className="flex-1 text-green-600 hover:bg-green-50 border border-green-200"
                >
                  <Check size={14} className="mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRejectEdit(suggestion.id)}
                  className="flex-1 text-red-600 hover:bg-red-50 border border-red-200"
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