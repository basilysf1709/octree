'use client'

import { useCallback, useEffect, useRef } from 'react'
import { EditorToolbar } from './EditorToolbar'
import { useDocument } from '@/hooks/useDocument'
import { Loader2 } from 'lucide-react'

interface EditorProps {
  documentId: string
  onShowSidebar: () => void
}

export function Editor({ documentId, onShowSidebar }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const { document, isLoading, isSaving, saveDocument } = useDocument(documentId)

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      console.log('Content changed, saving...', content.slice(0, 100)) // Debug log
      saveDocument(content)
    }
  }, [saveDocument])

  useEffect(() => {
    if (editorRef.current && document?.content) {
      editorRef.current.innerHTML = document.content
    }
  }, [document])

  // Add save on unmount
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        saveDocument.flush() // Forces any pending save
      }
    }
  }, [saveDocument])

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center">
      <Loader2 className="animate-spin" />
    </div>
  }

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
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-secondary px-3 py-1.5 rounded-md text-sm">
          Saving...
        </div>
      )}
    </div>
  )
} 