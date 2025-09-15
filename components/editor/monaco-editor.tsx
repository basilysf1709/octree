'use client';

import { useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import {
  latexLanguageConfiguration,
  latexTokenProvider,
  registerLatexCompletions,
} from '@/lib/editor-config';
import type * as Monaco from 'monaco-editor';

interface MonacoEditorProps {
  content: string;
  onChange: (value: string) => void;
  onMount: (
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco
  ) => void;
  className?: string;
}

export function MonacoEditor({
  content,
  onChange,
  onMount,
  className = '',
}: MonacoEditorProps) {
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

  return (
    <div className={className}>
      <Editor
        height="100%"
        defaultLanguage="latex"
        value={content}
        onChange={(value) => onChange(value || '')}
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
        onMount={onMount}
      />
    </div>
  );
}
