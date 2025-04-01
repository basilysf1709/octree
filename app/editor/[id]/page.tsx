/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import Editor, { loader } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { latexLanguageConfiguration, latexTokenProvider, registerLatexCompletions } from '@/lib/editor-config';
import { Chat } from '@/components/chat';
import { OctreeLogo } from '@/components/icons/octree-logo';
import { EditSuggestion } from '@/types/edit';
import { Check, X, Loader2 } from 'lucide-react';
import type * as Monaco from 'monaco-editor';
import { PDFViewer } from "@/components/PDFViewer";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams, useRouter } from 'next/navigation';

export default function EditorPage() {
  // Add Supabase client and params
  const supabase = createClientComponentClient();
  const params = useParams();
  const documentId = params.id as string;
  const router = useRouter();
  
  // Add document metadata state
  const [documentTitle, setDocumentTitle] = useState<string>("LaTeX Document");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
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
\\usepackage{amssymb}
\\title{Sample LaTeX Document with Equations}
\\author{Basil Yusuf}
\\date{18th Jan, 1991}

\\begin{document}

\\maketitle

\\section{Introduction}
This is a sample LaTeX document containing various equations to test your LaTeX to HTML compiler.

\\section{Simple Equations}
Here is a simple inline equation: $E = mc^2$. This famous equation relates energy and mass.

Here is a displayed equation:
\\begin{equation}
    F = G \\frac{m_1 m_2}{r^2}
\\end{equation}

\\section{More Complex Equations}
The quadratic formula for solving $ax^2 + bx + c = 0$ is:
\\begin{equation}
    x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
\\end{equation}

The binomial theorem provides the expansion:
\\begin{equation}
    (x + y)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^{n-k} y^k
\\end{equation}

Maxwell's equations in differential form include:
\\begin{align}
    \\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} \\\\
    \\nabla \\cdot \\mathbf{B} &= 0 \\\\
    \\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\
    \\nabla \\times \\mathbf{B} &= \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}
\\end{align}

\\section{Advanced Mathematical Notation}
The infinite series for $e^x$ is given by:
\\begin{equation}
    e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots
\\end{equation}

The definition of an integral:
\\begin{equation}
    \\int_{a}^{b} f(x) \\, dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i^*) \\Delta x
\\end{equation}

\\end{document}`);
  
  const [compiling, setCompiling] = useState(false);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [editSuggestions, setEditSuggestions] = useState<EditSuggestion[]>([]);
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<typeof Monaco | null>(null);
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
        body: JSON.stringify({ content })
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
      console.log("Starting PDF export...");
      const response = await fetch('/api/compilePDF', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      // Wait for save to complete in background
      await savePromise;
      
      if (!response.ok) throw new Error('PDF compilation failed');
      
      // Log raw response for debugging
      const rawText = await response.text();
      console.log("Raw response (first 100 chars):", rawText.substring(0, 100));
      
      // Parse manually to avoid potential issues
      let data;
      try {
        data = JSON.parse(rawText);
        console.log("JSON parsed successfully");
        console.log("PDF data present:", !!data.pdf);
        console.log("PDF size:", data.size);
        console.log("Base64 length:", data.pdf?.length);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error("Failed to parse server response");
      }
      
      // Continue with PDF processing...
      if (data.pdf) {
        console.log("Converting Base64 to binary...");
        
        // Convert Base64 back to binary
        const binaryString = atob(data.pdf);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        console.log("Creating blob from binary data...");
        // Create downloadable blob
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        console.log("Initiating download...");
        // Download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.pdf';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log("Download complete!");
      } else {
        throw new Error("No PDF data received from server");
      }
    } catch (error) {
      console.error('PDF export error:', error);
    } finally {
      setExportingPDF(false);
    }
  };

  const handleEditSuggestion = (suggestion: EditSuggestion) => {
    setEditSuggestions(prev => [...prev, suggestion]);
  };

  const handleAcceptEdit = (id: string) => {
    const suggestion = editSuggestions.find(s => s.id === id);
    if (!suggestion || !editor || !monacoInstance) {
      console.log('Missing dependencies:', { suggestion: !!suggestion, editor: !!editor, monaco: !!monacoInstance });
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
      forceMoveMarkers: true
    };

    editor.executeEdits('suggestion', [edit]);
    const newContent = editor.getValue();
    setContent(newContent);

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
    const pendingSuggestions = editSuggestions.filter(s => s.status === 'pending');
    
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
          glyphMarginHoverMessage: { value: 'Edit suggestion' }
        }
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
            attachedData: suggestion.id
          }
        }
      }
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
          setDocumentTitle(data.title || 'LaTeX Document');
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };
    
    fetchDocument();
  }, [documentId, supabase]);

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
              {lastSaved && (
                <span className="ml-6 text-sm text-gray-500">
                  {isSaving ? 'Saving...' : `Last saved: ${lastSaved.toLocaleTimeString()}`}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleCompile}
                disabled={compiling}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {compiling ? 'Compiling...' : 'Compile'}
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {exportingPDF ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </div>
                ) : (
                  'Export PDF'
                )}
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
                    const suggestion = decorations?.find(d => d.options.after && 'attachedData' in d.options.after);
                    if (suggestion?.options.after && 'attachedData' in suggestion.options.after) {
                      handleAcceptEdit(suggestion.options.after.attachedData as string);
                     }
                  }
                });
              }}
            />
          </div>

          {/* Preview - Replace with PDFViewer */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-4 overflow-auto">
            <PDFViewer 
              pdfData={pdfData} 
              isLoading={compiling} 
            />
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