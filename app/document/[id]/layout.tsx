import { generateMetadata } from '@/utils/metadata'

export const metadata = generateMetadata({
  title: 'Document Editor',
  description: 'Write and collaborate on documents with version control and AI assistance.',
  noIndex: true
})

export default function DocumentLayout({ children }: { children: React.ReactNode }) {
  return children
} 