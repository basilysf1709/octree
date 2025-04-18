'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OctreeLogo } from '@/components/icons/octree-logo';

export default function AuthPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };

    // Check initial session
    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <nav className="border-b border-blue-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <OctreeLogo className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-blue-900">Octree</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-sm">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb', // blue-600
                    brandAccent: '#1d4ed8', // blue-700
                  },
                },
              },
            }}
            providers={['github', 'google']}
          />
        </div>
      </div>
    </div>
  );
}
