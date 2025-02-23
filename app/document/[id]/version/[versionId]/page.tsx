'use client'

import { DocumentLayout } from '@/components/Editor/DocumentLayout'
import { DiffViewer } from '@/components/Editor/DiffViewer'
import { DocumentSettings } from '@/components/Editor/DocumentSettings'
import { GitCommit } from 'lucide-react'
import { use } from 'react'

type ChangeType = 'added' | 'removed' | 'modified' | 'context'

const dummyDiff = {
  id: 'f8d92e4b',
  message: 'Updated introduction',
  author: 'John Doe',
  time: '2h ago',
  changes: [
    { type: 'context' as ChangeType, content: 'Project Overview' },
    { type: 'added' as ChangeType, content: 'This document outlines our new approach to project management.' },
    { type: 'removed' as ChangeType, content: 'The old methodology was based on waterfall principles.' },
    { type: 'context' as ChangeType, content: 'Timeline' },
    { type: 'modified' as ChangeType, content: 'We will implement this strategy by Q2 2024' },
    { type: 'context' as ChangeType, content: 'The team will consist of:' },
    { type: 'added' as ChangeType, content: '- Senior Project Manager\n- Technical Lead\n- 3 Developers' },
  ]
}

export default function VersionPage({ params }: { params: Promise<{ id: string, versionId: string }> }) {
  const { id } = use(params)
  
  return (
    <DocumentLayout
      actions={<DocumentSettings showBlame={false} onBlameToggle={() => {}} />}
      info={
        <div className="flex items-center gap-3">
          <GitCommit className="text-muted-foreground" size={20} />
          <div>
            <h1 className="text-xl font-semibold">{dummyDiff.message}</h1>
            <p className="text-sm text-muted-foreground">
              <code className="text-primary">{dummyDiff.id}</code>
              {' • '}{dummyDiff.author}{' • '}{dummyDiff.time}
            </p>
          </div>
        </div>
      }
    >
      <DiffViewer version={dummyDiff} />
    </DocumentLayout>
  )
} 