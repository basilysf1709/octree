import { Metadata } from 'next'

export function generateMetadata({ title, description }: { 
  title?: string
  description?: string 
}): Metadata {
  return {
    title: title ? `${title} | Octree` : 'Octree',
    description: description || 'A version-controlled document editor',
    openGraph: {
      title: title || 'Octree',
      description: description || 'A version-controlled document editor',
    }
  }
} 