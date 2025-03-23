'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';

interface Document {
  id: string;
  title: string;
  updated_at: string;
}

export default function Dashboard() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndDocuments = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth');
        return;
      }

      // Get user name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', session.user.id)
        .single();

      setUserName(profile?.display_name || session.user.email);

      // Get documents
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setDocuments(data);
      }
      setLoading(false);
    };

    fetchUserAndDocuments();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const createNewDocument = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            title: 'Untitled Document',
            content: '\\documentclass{article}\n\\begin{document}\n\nHello LaTeX!\n\n\\end{document}',
            owner_id: session?.user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Use router.push to navigate to the editor page
        router.push(`/editor/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

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
            <div className="flex items-center space-x-6">
              <span className="text-blue-600">Welcome, {userName}</span>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Your Documents</h1>
            <p className="text-blue-600 mt-1">Manage and edit your LaTeX documents</p>
          </div>
          <Button
            onClick={createNewDocument}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Document
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white">
                <CardHeader>
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <Card className="bg-white p-12 text-center">
            <div className="text-blue-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">No documents yet</h3>
            <p className="text-blue-600 mb-6">Create your first LaTeX document to get started</p>
            <Button
              onClick={createNewDocument}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Document
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="bg-white hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/editor/${doc.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-blue-900 truncate">{doc.title}</CardTitle>
                  <CardDescription className="text-blue-600">
                    Last updated: {new Date(doc.updated_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 