import { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: 'Octree - Modern Document Editor with Version Control',
    template: '%s | Octree'
  },
  description: 'A modern document editor with built-in version control, real-time collaboration, and AI assistance. Write, collaborate, and track changes seamlessly.',
  keywords: ['document editor', 'version control', 'collaboration', 'writing', 'AI writing', 'markdown editor'],
  authors: [{ name: 'Octree Team' }],
  creator: 'Octree',
  publisher: 'Octree',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://useoctree.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://useoctree.com',
    title: 'Octree - Modern Document Editor with Version Control',
    description: 'A modern document editor with built-in version control, real-time collaboration, and AI assistance.',
    siteName: 'Octree',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Octree - Modern Document Editor'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Octree - Modern Document Editor with Version Control',
    description: 'Write better documents with version control and AI assistance',
    images: ['/twitter-image.png'],
    creator: '@octree'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest'
} 