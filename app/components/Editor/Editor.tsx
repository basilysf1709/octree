'use client'

import { useCallback, useEffect, useRef } from 'react'
import { EditorToolbar } from './EditorToolbar'
import { useDocument } from '@/hooks/useDocument'

interface EditorProps {
  documentId: string
  onShowSidebar: () => void
}

export function Editor({ documentId, onShowSidebar }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const { document, saveDocument } = useDocument(documentId)

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      // Implement auto-save here
      console.log('Content changed:', content)
    }
  }, [])

  useEffect(() => {
    if (editorRef.current && document?.content) {
      editorRef.current.innerHTML = document.content
    }
  }, [document])

  return (
    <div className="flex-1 flex flex-col">
      <EditorToolbar onShowSidebar={onShowSidebar} documentId={documentId} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-[900px] mx-auto p-8">
          <div
            ref={editorRef}
            className="min-h-[calc(100vh-200px)] outline-none prose prose-sm dark:prose-invert max-w-none"
            contentEditable
            onInput={handleInput}
            suppressContentEditableWarning
          />
        </div>
      </div>
    </div>
  )
} 