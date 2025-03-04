'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/UserContext'
import { LeafIcon } from '@/components/LeafIcon'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()

  // If already authenticated, redirect to documents
  useEffect(() => {
    if (user && !isAuthLoading) {
      router.replace('/documents')
    }
  }, [user, isAuthLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signIn(email, password)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading screen while checking auth status
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show login form
  if (!user && !isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Panel - Branding */}
        <div className="md:flex-1 bg-primary p-8 md:p-12 flex flex-col justify-between text-primary-foreground">
          <div>
            <div className="flex items-center gap-3">
              <LeafIcon className="w-10 h-10" />
              <h1 className="text-3xl font-bold">Octree</h1>
            </div>
            <p className="mt-4 text-lg text-primary-foreground/80">
              A modern document editor with version control built in.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center mt-1">
                  ✨
                </div>
                <div>
                  <h3 className="font-semibold">Real-time Collaboration</h3>
                  <p className="text-sm text-primary-foreground/70">
                    Work together with your team in real-time
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center mt-1">
                  🔄
                </div>
                <div>
                  <h3 className="font-semibold">Version Control</h3>
                  <p className="text-sm text-primary-foreground/70">
                    Track changes and manage document history
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center mt-1">
                  🔒
                </div>
                <div>
                  <h3 className="font-semibold">Secure by Default</h3>
                  <p className="text-sm text-primary-foreground/70">
                    Enterprise-grade security for your documents
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-background">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
              <p className="text-muted-foreground mt-2">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null // Prevents flash while redirecting
} 