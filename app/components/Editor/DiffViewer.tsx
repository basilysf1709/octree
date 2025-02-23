'use client'

import { GitCommit } from 'lucide-react'

interface DiffVersion {
  id: string
  message: string
  author: string
  time: string
  changes: Array<{
    type: 'added' | 'removed' | 'modified' | 'context'
    content: string
  }>
}

export function DiffViewer({ version }: { version: DiffVersion }) {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[850px] min-h-[1123px] mx-auto my-12 px-16 py-12 bg-white dark:bg-gray-900 border border-border">
          <div className="prose dark:prose-invert max-w-none">
            {version.changes.map((change, i) => (
              <div
                key={i}
                className={`font-mono ${
                  change.type === 'added'
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400 pl-4 border-l-4 border-l-green-500'
                    : change.type === 'removed'
                    ? 'bg-red-500/10 text-red-700 dark:text-red-400 pl-4 border-l-4 border-l-red-500'
                    : change.type === 'modified'
                    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 pl-4 border-l-4 border-l-blue-500'
                    : ''
                }`}
              >
                {change.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 