'use client'

import { GitCommit } from 'lucide-react'
import Link from 'next/link'

const dummyVersions = [
  {
    id: 'f8d92e4b',
    message: 'Updated introduction',
    author: 'John Doe',
    time: '2h ago',
    changes: [
      { type: 'added', content: 'This document outlines our new approach...' },
      { type: 'removed', content: 'The old methodology was based on...' },
      { type: 'modified', content: 'We will implement this strategy by Q2 2024' }
    ]
  },
  {
    id: 'c7b31a9d',
    message: 'Fixed typos and clarified points',
    author: 'Jane Smith',
    time: '5h ago',
    changes: [
      { type: 'modified', content: 'The project timeline has been updated' },
      { type: 'removed', content: 'Project will be completed by March' },
      { type: 'added', content: 'Expected completion date: April 2024' }
    ]
  },
  {
    id: 'a5e48c2f',
    message: 'Added new section',
    author: 'John Doe',
    time: '1d ago',
    changes: [
      { type: 'added', content: 'Added section about future improvements' }
    ]
  },
  {
    id: 'b9d25e7a',
    message: 'Initial commit',
    author: 'John Doe',
    time: '2d ago',
    changes: [
      { type: 'added', content: 'Initial document structure' }
    ]
  }
]

export function VersionHistory() {
  return (
    <div className="space-y-6 p-4">
      {dummyVersions.map((version) => (
        <div key={version.id} className="space-y-3">
          <Link 
            href={`/document/${location.pathname.split('/')[2]}/version/${version.id}`}
            className="flex items-start space-x-3 hover:bg-secondary/50 p-2 rounded-md -mx-2"
          >
            <GitCommit className="mt-1 text-muted-foreground" size={18} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{version.message}</span>
                <code className="text-xs text-primary bg-primary/10 px-1 py-0.5 rounded">
                  {version.id}
                </code>
              </div>
              <p className="text-sm text-muted-foreground">
                {version.author} • {version.time}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
} 