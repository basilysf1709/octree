'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Grid2X2, List, Plus, Trash2, Loader2 } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuth } from '@/context/UserContext'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { NewDocumentDialog } from '@/components/NewDocumentDialog'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'

interface Document {
  id: string
  name: string
  created_at: string
  last_edited: string
}

export default function DocumentsPage() {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid')
  const [showNewDialog, setShowNewDialog] = useState(false)
  const { user, isLoading } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)

  useEffect(() => {
    async function fetchDocuments() {
      if (!user) return
      
      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('last_edited', { ascending: false })

      if (!error && data) {
        setDocuments(data)
      }
      setIsLoadingDocuments(false)
    }

    fetchDocuments()
  }, [user])

  const handleDeleteClick = (doc: Document, e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    setDocumentToDelete(doc)
  }

  const handleDelete = async () => {
    if (!documentToDelete) return
    
    setDeletingId(documentToDelete.id)
    try {
      const response = await fetch(`/api/documents/${documentToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete document')

      // Remove document from state
      setDocuments(documents.filter(doc => doc.id !== documentToDelete.id))
      setDocumentToDelete(null) // Close dialog
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading || isLoadingDocuments) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return null // AuthProvider will handle redirect
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Documents</h1>
          <div className="flex items-center gap-2">
            <div className="border border-border rounded-md p-1">
              <button
                onClick={() => setViewType('grid')}
                className={`p-1.5 rounded ${viewType === 'grid' ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
              >
                <Grid2X2 size={20} />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-1.5 rounded ${viewType === 'list' ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
              >
                <List size={20} />
              </button>
            </div>
            <button
              onClick={() => setShowNewDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus size={20} />
              New Document
            </button>
          </div>
        </div>

        <div className="mb-8">
          {viewType === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/document/${doc.id}`}
                  className={cn(
                    "group relative p-6 border border-border rounded-lg hover:border-primary/50 transition-colors",
                    deletingId === doc.id && "opacity-50 pointer-events-none"
                  )}
                >
                  <button
                    onClick={(e) => handleDeleteClick(doc, e)}
                    className="absolute top-2 right-2 p-2 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-opacity"
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </button>
                  <h2 className="font-medium mb-2">{doc.name}</h2>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <code className="text-primary">{doc.id.slice(0, 8)}</code>
                    <span>{new Date(doc.last_edited).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-border rounded-lg divide-y divide-border">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/document/${doc.id}`}
                  className={cn(
                    "group relative flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors",
                    deletingId === doc.id && "opacity-50 pointer-events-none"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <h2 className="font-medium">{doc.name}</h2>
                    <code className="text-primary text-sm">{doc.id.slice(0, 8)}</code>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(doc.last_edited).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => handleDeleteClick(doc, e)}
                      className="p-2 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-opacity"
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <NewDocumentDialog 
        isOpen={showNewDialog} 
        onClose={() => setShowNewDialog(false)} 
      />
      <DeleteConfirmDialog
        isOpen={documentToDelete !== null}
        isDeleting={deletingId === documentToDelete?.id}
        documentName={documentToDelete?.name || ''}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
} 