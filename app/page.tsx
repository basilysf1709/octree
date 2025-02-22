'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Grid2X2, List, Plus } from 'lucide-react'
import { Header } from '@/components/Header'

const dummyProjects = [
  { id: 'a8f2e4d1', name: 'Project Documentation', lastEdited: '2h ago' },
  { id: 'b7c9d3e5', name: 'Meeting Notes', lastEdited: '1d ago' },
  { id: 'f5e2d9c4', name: 'Research Paper', lastEdited: '3d ago' },
  { id: 'k2j8h6g4', name: 'Product Roadmap', lastEdited: '1w ago' },
]

export default function Home() {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid')

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Your Documents</h1>
          <div className="flex items-center gap-4">
            <div className="flex bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewType('grid')}
                className={`p-1.5 rounded ${viewType === 'grid' ? 'bg-background' : ''}`}
              >
                <Grid2X2 size={20} />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-1.5 rounded ${viewType === 'list' ? 'bg-background' : ''}`}
              >
                <List size={20} />
              </button>
            </div>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg">
              <Plus size={20} />
              New Document
            </button>
          </div>
        </div>

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
    </div>
  )
}
