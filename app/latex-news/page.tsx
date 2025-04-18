'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OctreeLogo } from '@/components/icons/octree-logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { CalendarIcon, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  source: string;
  url: string;
  imageUrl?: string;
}

export default function LatexNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Get user name
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .single();

        setUserName(profile?.display_name || session.user.email);
      }
    };

    fetchUserData();
  }, [supabase]);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch('/api/latex-news');

        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        const data = await response.json();
        setNews(data.news);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching LaTeX news:', err);
        setError('Failed to load LaTeX news. Please try again later.');
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <nav className="border-b border-blue-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <OctreeLogo className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-blue-900">Octree</span>
              </Link>
              <div className="ml-10 hidden space-x-8 md:flex">
                <Link
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Dashboard
                </Link>
                <Link
                  href="/latex-news"
                  className="border-b-2 border-blue-600 text-blue-600 hover:text-blue-800"
                >
                  LaTeX News
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {userName ? (
                <>
                  <span className="text-blue-600">Welcome, {userName}</span>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/auth">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-blue-900">
            Latest LaTeX News
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-blue-600">
            Stay updated with the latest developments, releases, and tools in
            the LaTeX ecosystem
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="mb-4 text-red-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Card
                key={item.id}
                className="bg-white transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-blue-900">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center text-blue-600">
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        {formatDate(item.date)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-800">{item.summary}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t border-blue-100 pt-4">
                  <div className="flex items-center text-blue-500">
                    <Globe className="mr-1 h-4 w-4" />
                    <span className="text-sm">{item.source}</span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Read more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
