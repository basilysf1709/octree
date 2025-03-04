'use client'

import { useParams } from 'next/navigation'
import { DocumentEditor } from '@/components/Editor/DocumentEditor'
import { DocumentLayout } from '@/components/Editor/DocumentLayout'
import { DocumentSettings } from '@/components/Editor/DocumentSettings'

export default function Page() {
  const params = useParams<{ id: string }>()
  
  return (
    <DocumentLayout
      actions={<DocumentSettings showBlame={false} onBlameToggle={() => {}} />}
    >
      <DocumentEditor 
        documentId={params.id}
      />
    </DocumentLayout>
  )
} 