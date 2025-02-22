'use client'

import { DocumentEditor } from '@/components/Editor/DocumentEditor'
import { DocumentLayout } from '@/components/Editor/DocumentLayout'
import { DocumentSettings } from '@/components/Editor/DocumentSettings'
import { use } from 'react'

const dummyContent = {
  'a8f2e4d1': 'Project Documentation\n\nThis is a sample project documentation with some content...',
  'b7c9d3e5': 'Meeting Notes\n\nAttendees: John, Sarah, Mike\nTopics discussed: Project timeline, resource allocation...',
  'f5e2d9c4': 'Research Paper\n\nAbstract\nThis paper explores the implications of...',
  'k2j8h6g4': 'Product Roadmap\n\nQ1 2024\n- Feature A launch\n- Infrastructure improvements...',
}

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  return (
    <DocumentLayout
      actions={<DocumentSettings showBlame={false} onBlameToggle={() => {}} />}
    >
      <DocumentEditor 
        documentId={id}
        initialContent={dummyContent[id as keyof typeof dummyContent]} 
      />
    </DocumentLayout>
  )
} 