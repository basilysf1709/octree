'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import { LeafIcon } from './LeafIcon'

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="border-b border-border bg-background">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <Link href="/" className="text-lg font-semibold hover:text-primary flex items-center gap-2">
          <LeafIcon className="w-6 h-6 text-primary" />
          Octree
        </Link>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-secondary rounded-md"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  )
} 