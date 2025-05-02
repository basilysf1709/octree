'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { OctreeLogo } from '@/components/icons/octree-logo';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const supabase = createClientComponentClient();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
    };

    checkAuth();

    // Set up listener for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
    window.location.href = '/';
  };

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation - Refined with subtle shadow and improved spacing */}
      <nav className="sticky top-0 z-50 border-b border-blue-100 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <OctreeLogo className="h-8 w-8 text-blue-600" />
                <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-xl font-bold text-transparent">Octree</span>
              </Link>
              <div className="ml-10 hidden items-center space-x-8 md:flex">
                <Link
                  href="#features"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Pricing
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <Button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Sign Out'
                  )}
                </Button>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Sign in
                  </Link>
                  <Link href="/auth">
                    <Button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Improved with animations and academic styling */}
      <div className="relative overflow-hidden">
        {/* Abstract pattern background */}
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%231E3A8A' fill-opacity='0.25' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '180px 180px',
          }}
        />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 z-0 bg-grid-blue-600/[0.03]" />
        
        <div className="relative container mx-auto px-4 pt-20 pb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 shadow-sm">
              <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-sm font-medium text-transparent">
                Now in public beta
              </span>
            </div>
            
            <h1 className="mb-6 font-serif text-6xl font-bold leading-tight tracking-tight text-blue-900 md:text-7xl">
              Write <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 bg-clip-text text-transparent">LaTeX</span> Documents with Octree
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-xl font-light leading-relaxed text-blue-700 md:text-2xl">
              The intelligent LaTeX editor that makes academic writing feel
              natural and effortless
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth">
                <Button className="w-full rounded-full bg-blue-600 px-8 py-6 text-lg font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl sm:w-auto">
                  Start Writing Free
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-2 border-blue-200 bg-white/80 px-8 py-6 text-lg font-medium text-blue-700 backdrop-blur-sm transition-all hover:bg-blue-50 sm:w-auto"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                  </svg>
                  Watch Demo
                </Button>
              </Link>
            </div>
            
            {/* Video with improved presentation */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-16"
            >
              <div className="relative rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 p-1.5 shadow-2xl">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-300 opacity-20 blur-sm"></div>
                <div className="relative rounded-lg overflow-hidden border border-blue-100 bg-white shadow-inner">
                  <video 
                    className="w-full"
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                  >
                    <source src="/main.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </motion.div>

            {/* Feature badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-blue-700 sm:gap-8 sm:text-sm">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="flex items-center rounded-full bg-blue-50 px-4 py-2 shadow-sm"
              >
                <svg
                  className="mr-2 h-4 w-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Free for students
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="flex items-center rounded-full bg-blue-50 px-4 py-2 shadow-sm"
              >
                <svg
                  className="mr-2 h-4 w-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No credit card required
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="flex items-center rounded-full bg-blue-50 px-4 py-2 shadow-sm"
              >
                <svg
                  className="mr-2 h-4 w-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cancel anytime
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section - Academic journal inspired design */}
      <div className="border-y border-blue-100 bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-4 md:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 font-serif text-4xl font-bold text-blue-800">Beta</div>
              <div className="h-0.5 w-10 bg-blue-200 mb-2"></div>
              <p className="text-blue-700 font-medium">Development Stage</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 font-serif text-4xl font-bold text-blue-800">5+</div>
              <div className="h-0.5 w-10 bg-blue-200 mb-2"></div>
              <p className="text-blue-700 font-medium">LaTeX Templates</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 font-serif text-4xl font-bold text-blue-800">AI</div>
              <div className="h-0.5 w-10 bg-blue-200 mb-2"></div>
              <p className="text-blue-700 font-medium">Powered Editor</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 font-serif text-4xl font-bold text-blue-800">100%</div>
              <div className="h-0.5 w-10 bg-blue-200 mb-2"></div>
              <p className="text-blue-700 font-medium">Open Source</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Academic journal-inspired design */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="font-serif text-5xl font-bold text-blue-900">Advanced Features</h2>
              <div className="mx-auto mt-4 h-1 w-20 bg-blue-300"></div>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-700">
                Discover why researchers and academics choose Octree for their LaTeX documents
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-xl border border-blue-100 bg-gradient-to-b from-white to-blue-50 p-6 shadow-md transition-all hover:shadow-lg"
                >
                  <div className="mb-4 rounded-full bg-blue-100 p-3 w-fit">
                    <div className="rounded-full bg-gradient-to-br from-blue-600 to-blue-500 p-2 text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="mb-3 font-serif text-xl font-bold text-blue-800">
                    {feature.title}
                  </h3>
                  <p className="text-blue-700 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Updated with academic styling */}
      <section className="relative bg-blue-50 py-20">
        <div 
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231E3A8A' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="font-serif text-5xl font-bold text-blue-900">How It Works</h2>
              <div className="mx-auto mt-4 h-1 w-20 bg-blue-300"></div>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-700">
                Four simple steps to transform your academic writing experience
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-blue-700 shadow-md">
                    {index + 1}
                    {index < steps.length - 1 && (
                      <div className="absolute left-16 top-8 hidden h-0.5 w-full -translate-y-1/2 bg-blue-200 md:block"></div>
                    )}
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-bold text-blue-800">
                    {step.title}
                  </h3>
                  <p className="text-blue-700">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Academic-styled with elegant cards */}
      <section id="pricing" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="font-serif text-5xl font-bold text-blue-900">Pricing Plans</h2>
              <div className="mx-auto mt-4 h-1 w-20 bg-blue-300"></div>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-700">
                Simple, transparent pricing for all your LaTeX editing needs
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-xl border border-blue-100 bg-white p-8 shadow-lg transition-all hover:shadow-xl"
              >
                <div className="absolute -right-10 -top-10 h-20 w-20 rounded-full bg-blue-50"></div>
                <div className="mb-6">
                  <h3 className="mb-2 font-serif text-2xl font-bold text-blue-900">Free</h3>
                  <div className="h-0.5 w-12 bg-blue-200"></div>
                </div>
                <div className="mb-6">
                  <span className="font-serif text-5xl font-bold text-blue-800">$0</span>
                  <span className="text-blue-700">/month</span>
                </div>
                <ul className="mb-8 space-y-3 text-blue-700">
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Up to 3 documents</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Basic AI assistance</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>PDF Export</span>
                  </li>
                </ul>
                <Button className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700">
                  Get Started
                </Button>
              </motion.div>

              {/* Pro Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-xl border-2 border-blue-200 bg-white p-8 shadow-xl transition-all hover:shadow-2xl"
              >
                <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-100"></div>
                <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-blue-50"></div>
                <div className="mb-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 w-fit">
                  MOST POPULAR
                </div>
                <div className="mb-6">
                  <h3 className="mb-2 font-serif text-2xl font-bold text-blue-900">Pro</h3>
                  <div className="h-0.5 w-12 bg-blue-400"></div>
                </div>
                <div className="mb-6">
                  <span className="font-serif text-5xl font-bold text-blue-800">$10</span>
                  <span className="text-blue-700">/month</span>
                </div>
                <ul className="mb-8 space-y-3 text-blue-700">
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Unlimited documents</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Advanced AI assistance</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Real-time collaboration</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 py-3 font-medium text-white transition-all hover:from-blue-800 hover:to-blue-600"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Subscribe Now'}
                </Button>
              </motion.div>

              {/* Team Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-xl border border-blue-100 bg-white p-8 shadow-lg transition-all hover:shadow-xl"
              >
                <div className="absolute -left-10 -top-10 h-20 w-20 rounded-full bg-blue-50"></div>
                <div className="mb-6">
                  <h3 className="mb-2 font-serif text-2xl font-bold text-blue-900">Team</h3>
                  <div className="h-0.5 w-12 bg-blue-200"></div>
                </div>
                <div className="mb-6">
                  <span className="font-serif text-5xl font-bold text-blue-800">$30</span>
                  <span className="text-blue-700">/month</span>
                </div>
                <ul className="mb-8 space-y-3 text-blue-700">
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Up to 15 team members</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>All Pro features</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Team permissions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Dedicated support</span>
                  </li>
                </ul>
                <Button className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700">
                  Contact Sales
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Academic publication style */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 font-serif text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
                Ready to elevate your academic writing?
              </h2>
              <p className="mb-8 text-lg text-blue-100">
                Join thousands of researchers who&apos;ve simplified their LaTeX workflow
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth">
                  <Button className="w-full rounded-lg bg-white px-8 py-3 font-medium text-blue-800 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl sm:w-auto">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    variant="outline"
                    className="w-full rounded-lg border-2 border-white bg-transparent px-8 py-3 font-medium text-white transition-all hover:bg-white/10 sm:w-auto"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer - Academic journal inspired */}
      <footer className="bg-blue-900 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mb-12 grid grid-cols-2 gap-12 md:grid-cols-5">
            <div className="col-span-2">
              <Link href="/" className="mb-6 flex items-center space-x-2">
                <OctreeLogo className="h-10 w-10 text-white" />
                <span className="text-2xl font-bold text-white">Octree</span>
              </Link>
              <p className="mb-6 max-w-md text-blue-200">
                The intelligent LaTeX editor for researchers, academics, and students.
                Simplify complex document creation with AI assistance.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="rounded-full bg-blue-800 p-2 text-blue-200 transition-colors hover:bg-blue-700 hover:text-white"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>

            {footerLinks.map((section, index) => (
              <div key={index} className="md:text-left">
                <h4 className="mb-6 font-serif text-lg font-semibold text-white">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-blue-200 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between border-t border-blue-800 pt-8 md:flex-row">
            <p className="mb-4 text-sm text-blue-300 md:mb-0">
              © 2023 Octree. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-blue-300 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-blue-300 hover:text-white">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-blue-300 hover:text-white">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const steps = [
  {
    title: 'Sign Up',
    description: 'Create your free account in seconds',
  },
  {
    title: 'Choose Template',
    description: 'Select from our pre-built templates',
  },
  {
    title: 'Write & Edit',
    description: 'Use AI assistance to write faster',
  },
  {
    title: 'Export & Share',
    description: 'Download as PDF or share with others',
  },
];

const features = [
  {
    title: 'AI-Powered Assistance',
    description:
      'Get intelligent suggestions and autocompletions as you write your LaTeX documents.',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    title: 'Real-time Collaboration',
    description:
      'Work together with your team in real-time, with instant updates and version control.',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    title: 'PDF Preview',
    description:
      'See your changes instantly with our built-in PDF preview feature.',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    ),
  },
];

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#' },
      { label: 'Templates', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Tutorials', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Support', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

const socialLinks = [
  {
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    href: '#',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
    href: '#',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.819-.26.819-.578 0-.284-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.386-1.332-1.755-1.332-1.755-1.087-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12" />
      </svg>
    ),
    href: '#',
  },
];
