import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/documents/', '/profile/', '/settings/'],
    },
    sitemap: 'https://octree.com/sitemap.xml',
  }
} 