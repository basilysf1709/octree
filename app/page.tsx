'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/UserContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ArrowRight, GitBranch, Users2, Zap, Shield, Check } from 'lucide-react'
import Link from 'next/link'
import { CodeAnimation } from '@/components/ui/CodeAnimation'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/documents')
    }
  }, [user, isLoading, router])

  if (isLoading || user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative border-b border-border">
        <div className="max-w-7xl mx-auto px-8 py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold tracking-tight">
              Document editing with{' '}
              <span className="text-primary">version control</span> built in
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Octree combines the simplicity of a document editor with the power of version control.
              Write, collaborate, and track changes seamlessly.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/login"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </section>

      {/* Features Section */}
      <section id="features" className="bg-secondary/30">
        <div className="max-w-7xl mx-auto px-8 py-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Everything you need to write better</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features that help you manage your documents efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-background border border-border rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <GitBranch className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Version Control</h3>
              <p className="text-muted-foreground">
                Track changes, create versions, and never lose your work
              </p>
            </div>

            <div className="p-6 bg-background border border-border rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users2 className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Collaboration</h3>
              <p className="text-muted-foreground">
                Work together with your team in real-time
              </p>
            </div>

            <div className="p-6 bg-background border border-border rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Blazing fast performance with instant saves
              </p>
            </div>

            <div className="p-6 bg-background border border-border rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
              <p className="text-muted-foreground">
                Bank-grade security for your documents
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-y border-border">
        <div className="max-w-7xl mx-auto px-8 py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Focus on writing, let us handle the rest
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Automatic versioning</h3>
                    <p className="text-muted-foreground">
                      Every change is automatically tracked and versioned
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Smart conflict resolution</h3>
                    <p className="text-muted-foreground">
                      Seamlessly merge changes from multiple collaborators
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Check className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Powerful search</h3>
                    <p className="text-muted-foreground">
                      Find any document or version instantly
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <CodeAnimation />
              <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary/30">
        <div className="max-w-7xl mx-auto px-8 py-32">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of teams who use Octree to manage their documents
            </p>
            <Link
              href="/login"
              className="mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              Join now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
