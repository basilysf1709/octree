import { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ArrowRight, GitBranch, Users2, Zap, Shield, Check, Star } from 'lucide-react'
import Link from 'next/link'
import { CodeAnimation } from '@/components/ui/CodeAnimation'
import { JsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Octree - AI for Documents',
  description: 'A modern document editor with built-in version control, real-time collaboration, and AI assistance. Write, collaborate, and track changes seamlessly.',
  keywords: ['document editor', 'version control', 'collaboration', 'writing', 'markdown', 'AI writing assistant'],
  openGraph: {
    title: 'Octree - AI for Documents',
    description: 'Write better documents with version control and AI assistance',
    images: ['/og-image.png'],
  }
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Octree",
    "applicationCategory": "Document Editor",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "A modern document editor with built-in version control and AI assistance"
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden border-b border-border">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                  <Star size={16} />
                  <span className="text-sm font-medium">Now in Beta</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  Write Better Documents with{' '}
                  <span className="text-primary">AI</span>
                </h1>
                
                <p className="text-xl text-muted-foreground">
                  A modern document editor that helps teams write, collaborate, and track changes seamlessly.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    Try Beta for Free
                    <ArrowRight size={20} className="ml-2" />
                  </Link>
                  <Link
                    href="#features"
                    className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium border border-border rounded-lg hover:bg-secondary"
                  >
                    See how it works
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
                  <div>
                    <div className="text-2xl font-bold">Beta</div>
                    <div className="text-muted-foreground">Access Now</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">14 Days</div>
                    <div className="text-muted-foreground">Free Trial</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-muted-foreground">Support</div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <CodeAnimation />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 border-b border-border">
          <div className="container px-4 mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need to write better</h2>
              <p className="text-xl text-muted-foreground">
                Powerful features to help you manage your documents efficiently
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <GitBranch size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI</h3>
                <p className="text-muted-foreground">
                  Track changes, compare versions, and never lose your work with built-in version control.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Users2 size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Collaboration</h3>
                <p className="text-muted-foreground">
                  Work together with your team in real-time with presence awareness and live editing.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
                <p className="text-muted-foreground">
                  Get intelligent writing suggestions and improvements powered by AI.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 border-b border-border bg-secondary/30">
          <div className="container px-4 mx-auto max-w-7xl text-center">
            <h2 className="text-3xl font-bold mb-12">Trusted by teams worldwide</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-50">
              {/* Add company logos here */}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container px-4 mx-auto max-w-7xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of teams who are already writing better documents.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Start Writing Now
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
