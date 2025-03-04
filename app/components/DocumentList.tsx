'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { File, MoreVertical } from 'lucide-react'
import { NewDocumentDialog } from './NewDocumentDialog'

interface Document {
  id: string
  name: string
  created_at: string
  last_edited: string
}

interface DocumentListProps {
  documents: Document[]
}

export function DocumentList({ documents }: DocumentListProps) {
  const [isNewDocumentOpen, setIsNewDocumentOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Create New Document Card */}
        <button
          onClick={() => setIsNewDocumentOpen(true)}
          className="h-40 border-2 border-dashed rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
        >
          <File size={24} />
          <span>Create New Document</span>
        </button>

        {/* Document Cards */}
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/document/${doc.id}`}
            className="group h-40 border rounded-lg p-4 hover:border-primary transition-colors"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-start justify-between">
                <h3 className="font-medium group-hover:text-primary truncate">
                  {doc.name}
                </h3>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={16} />
                </button>
              </div>
              <div className="mt-auto">
                <p className="text-sm text-muted-foreground">
                  Last edited {formatDistanceToNow(new Date(doc.last_edited))} ago
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <NewDocumentDialog
        isOpen={isNewDocumentOpen}
        onClose={() => setIsNewDocumentOpen(false)}
      />
    </>
  )
} 