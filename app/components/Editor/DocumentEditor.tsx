'use client'

import React, { useState, useRef, useEffect } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { VersionHistory } from './VersionHistory';
import { DocumentSettings } from './DocumentSettings';
import { BlameLine } from './BlameInfo';

// Dummy blame data for demonstration
const dummyBlameData = {
  'line1': { id: 'f8d92e4b', author: 'John Doe', time: '2h ago' },
  'line2': { id: 'c7b31a9d', author: 'Jane Smith', time: '5h ago' },
  'line3': { id: 'a5e48c2f', author: 'John Doe', time: '1d ago' },
};

interface DocumentEditorProps {
  initialContent?: string;
  documentId: string;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ initialContent = '', documentId }) => {
  const [content, setContent] = useState(initialContent);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showBlame, setShowBlame] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent.replace(/\n/g, '<br>');
    }
  }, [initialContent]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.textContent || '');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <EditorToolbar onShowSidebar={() => setShowSidebar(!showSidebar)} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[850px] min-h-[1123px] mx-auto my-12 px-16 py-12 bg-white dark:bg-gray-900 border border-border">
            {showBlame && (
              <div className="absolute -left-[200px] w-[180px] text-right space-y-1">
                {Object.entries(dummyBlameData).map(([line, info]) => (
                  <BlameLine 
                    key={line}
                    info={info}
                    documentId={documentId}
                  />
                ))}
              </div>
            )}
            <div
              ref={editorRef}
              className="prose dark:prose-invert max-w-none min-h-[calc(100vh-8rem)]"
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              style={{ outline: 'none' }}
            >
              {content === '' && <span className="text-gray-400">Start typing...</span>}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        {showSidebar && (
          <div className="w-[300px] border-l border-border bg-background overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border">
              <div className="flex items-center justify-between p-4">
                <h2 className="text-lg font-semibold">Version History</h2>
                <button 
                  onClick={() => setShowSidebar(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            </div>
            <VersionHistory />
          </div>
        )}
      </div>
    </div>
  );
}; 