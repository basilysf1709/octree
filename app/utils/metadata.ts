import { Metadata } from 'next'

export function generateMetadata({ 
  title, 
  description,
  path = '',
  noIndex = false 
}: { 
  title?: string
  description?: string
  path?: string
  noIndex?: boolean
}): Metadata {
  const baseUrl = 'https://useoctree.com' // Replace with your domain

  return {
    title: title ? `${title} | Octree` : undefined,
    description,
    openGraph: title ? {
      title: `${title} | Octree`,
      description,
      url: `${baseUrl}${path}`,
      siteName: 'Octree',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale: 'en_US',
      type: 'website',
    } : null,
    robots: {
      index: !noIndex,
      follow: !noIndex,
    }
  }
} 