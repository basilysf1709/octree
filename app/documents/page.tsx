'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Grid2X2, List, Plus } from 'lucide-react'
import { Header } from '@/components/Header'
import { useAuth } from '@/context/UserContext'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const dummyProjects = [
  { id: 'a8f2e4d1', name: 'Project Documentation', lastEdited: '2h ago' },
  { id: 'b7c9d3e5', name: 'Meeting Notes', lastEdited: '1d ago' },
  { id: 'f5e2d9c4', name: 'Research Paper', lastEdited: '3d ago' },
  { id: 'k2j8h6g4', name: 'Product Roadmap', lastEdited: '1w ago' },
]

export default function DocumentsPage() {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid')
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return null // AuthProvider will handle redirect
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Documents</h1>
          <div className="flex items-center gap-2">
            <div className="border border-border rounded-md p-1">
              <button
                onClick={() => setViewType('grid')}
                className={`p-1.5 rounded ${viewType === 'grid' ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
              >
                <Grid2X2 size={20} />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-1.5 rounded ${viewType === 'list' ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
              >
                <List size={20} />
              </button>
            </div>
            <Link
              href="/document/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <Plus size={20} />
              New Document
            </Link>
          </div>
        </div>

        <div className="mb-8">
          {viewType === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dummyProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/document/${project.id}`}
                  className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <h2 className="font-medium mb-2">{project.name}</h2>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <code className="text-primary">{project.id}</code>
                    <span>{project.lastEdited}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-border rounded-lg divide-y divide-border">
              {dummyProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/document/${project.id}`}
                  className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <h2 className="font-medium">{project.name}</h2>
                    <code className="text-primary text-sm">{project.id}</code>
                  </div>
                  <span className="text-sm text-muted-foreground">{project.lastEdited}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 