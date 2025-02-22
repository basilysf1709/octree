'use client'

import { Header } from '@/components/Header'
import { DiffViewer } from '@/components/Editor/DiffViewer'

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

export default function VersionPage({ params }: { params: { id: string, versionId: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DiffViewer version={dummyDiff} />
    </div>
  )
} 