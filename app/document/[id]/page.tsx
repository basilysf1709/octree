import { generateMetadata } from '@/utils/metadata'
import { DocumentPage } from './DocumentPage'

export const metadata = generateMetadata({
  title: 'Document Editor',
  description: 'Write and collaborate on documents with version control and AI assistance.',
  noIndex: true // Protect document pages from indexing
})

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params
  return <DocumentPage params={resolvedParams} />
} 