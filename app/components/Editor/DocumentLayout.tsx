'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DocumentLayoutProps {
  children: React.ReactNode
  actions?: React.ReactNode // For settings or other actions
}

export function DocumentLayout({ children, actions }: DocumentLayoutProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border bg-background">
        <div className="max-w-[1200px] h-full mx-auto px-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-secondary rounded"
          >
            <ArrowLeft size={20} />
          </button>
          {actions}
        </div>
      </div>
      {children}
    </div>
  )
} 