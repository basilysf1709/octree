import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'Octree',
    short_name: 'Octree',
    description: 'A modern document editor with version control built in',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon'
      }
    ]
  })
} 