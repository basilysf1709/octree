'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorToolbar } from './EditorToolbar'
import { useDocument } from '@/hooks/useDocument'
import { Loader2 } from 'lucide-react'
import { AIChatbot } from './AIChatbot'

interface EditorProps {
  documentId: string
  onShowSidebar: () => void
}

export function Editor({ documentId, onShowSidebar }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const { document, isLoading, isSaving, error, saveDocument } = useDocument(documentId)
  const [hasContent, setHasContent] = useState(false)

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      
      // Only skip empty or single <br> content
      if (!content || content === '<br>' || content === '&nbsp;') {
        setHasContent(false)
        return
      }
      
      setHasContent(true)
      console.log('Input event triggered', { 
        contentLength: content.length,
        preview: content.slice(0, 100),
        documentId
      })
      saveDocument(content)
    }
  }, [saveDocument, documentId])

  const handleAIUpdate = (newContent: string) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = newContent;
      saveDocument(newContent);
    }
  };

  // Set initial content
  useEffect(() => {
    if (editorRef.current) {
      if (document?.content) {
        editorRef.current.innerHTML = document.content
        setHasContent(true)
      } else {
        editorRef.current.innerHTML = ''
        setHasContent(false)
      }
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

  // Add onBlur handler to ensure we catch all changes
  useEffect(() => {
    const editor = editorRef.current
    if (editor) {
      const handleBlur = () => {
        console.log('Editor blur - forcing save')
        saveDocument.flush() // Force any pending saves
      }
      editor.addEventListener('blur', handleBlur)
      return () => editor.removeEventListener('blur', handleBlur)
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
            className={`
              min-h-[calc(100vh-200px)] 
              outline-none 
              prose 
              prose-sm 
              dark:prose-invert 
              max-w-none
              ${!hasContent ? 'before:content-["Start_typing..."] before:text-muted-foreground' : ''}
            `}
            contentEditable
            onInput={handleInput}
            suppressContentEditableWarning
          />
        </div>
      </div>
      
      <AIChatbot 
        documentContent={editorRef.current?.innerHTML || ''} 
        onUpdateContent={handleAIUpdate}
      />

      {error && (
        <div className="fixed bottom-4 right-4 bg-destructive/10 text-destructive px-3 py-1.5 rounded-md text-sm">
          Error saving: {error.message}
        </div>
      )}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-secondary px-3 py-1.5 rounded-md text-sm">
          Saving...
        </div>
      )}
    </div>
  )
} 