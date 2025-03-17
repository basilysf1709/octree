'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      console.log('Checking user session');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Session check result:', { hasSession: !!session, error });
      
      if (session) {
        console.log('User is authenticated, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('No session found, showing auth form');
        setIsLoading(false);
      }
    };

    checkUser();
    setIsMounted(true);
  }, [router, supabase]);

  // Add auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, { hasSession: !!session });
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-blue-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z" />
                </svg>
                <span className="text-xl font-bold text-blue-900">Octree</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-blue-900 mb-2">Welcome to Octree</h1>
              <p className="text-blue-600">Sign in or create an account to get started</p>
            </div>

            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#2563EB',
                      brandAccent: '#1D4ED8',
                    }
                  }
                }
              }}
              theme="default"
              magicLink={false}
              providers={[]}
              redirectTo="http://localhost:3000/auth/callback"
            />

            <div className="mt-8 pt-6 text-center border-t border-blue-100">
              <p className="text-sm text-blue-600">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-blue-700 hover:text-blue-800 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-700 hover:text-blue-800 underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-blue-600">
              Need help?{' '}
              <Link href="/support" className="text-blue-700 hover:text-blue-800 underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 