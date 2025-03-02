'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, ChevronDown, Settings, User, HelpCircle, LogOut } from 'lucide-react'
import Link from 'next/link'
import { LeafIcon } from './LeafIcon'
import { useAuth } from '@/context/UserContext'
import { useState } from 'react'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <div className="border-b border-border bg-background sticky top-0 z-50">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <Link href="/" className="text-lg font-semibold hover:text-primary flex items-center gap-2">
          <LeafIcon className="w-6 h-6 text-primary" />
          Octree
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 hover:bg-secondary rounded-md"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user && (
            <div className="relative z-50">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-secondary rounded-md"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="text-sm">{user.name}</span>
                <ChevronDown size={16} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <div className="px-3 py-2">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="p-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 w-full p-2 text-sm hover:bg-secondary rounded-md"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 w-full p-2 text-sm hover:bg-secondary rounded-md"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <Link
                      href="/help"
                      className="flex items-center gap-2 w-full p-2 text-sm hover:bg-secondary rounded-md"
                    >
                      <HelpCircle size={16} />
                      Help & Feedback
                    </Link>
                  </div>

                  <div className="p-1 border-t border-border">
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-2 w-full p-2 text-sm hover:bg-secondary rounded-md text-red-500 hover:text-red-600"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 