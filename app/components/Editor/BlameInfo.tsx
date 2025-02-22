'use client'

import Link from 'next/link'
import { GitCommit } from 'lucide-react'

interface BlameInfo {
  id: string
  author: string
  time: string
}

interface BlameLineProps {
  info: BlameInfo
  documentId: string
}

export function BlameLine({ info, documentId }: BlameLineProps) {
  return (
    <Link 
      href={`/document/${documentId}/version/${info.id}`}
      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground p-1 hover:bg-secondary/50 rounded"
    >
      <GitCommit size={14} />
      <code className="text-primary">{info.id.slice(0, 8)}</code>
      <span>{info.author}</span>
      <span>•</span>
      <span>{info.time}</span>
    </Link>
  )
} 