'use client'

import { use } from 'react'
import { DocumentEditor } from '@/components/Editor/DocumentEditor'
import { DocumentLayout } from '@/components/Editor/DocumentLayout'
import { DocumentSettings } from '@/components/Editor/DocumentSettings'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function Page({ params }: PageProps) {
  const resolvedParams = use(params)
  
  return (
    <DocumentLayout
      actions={<DocumentSettings showBlame={false} onBlameToggle={() => {}} />}
    >
      <DocumentEditor 
        documentId={resolvedParams.id}
      />
    </DocumentLayout>
  )
} 