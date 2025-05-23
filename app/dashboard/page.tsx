'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { OctreeLogo } from '@/components/icons/octree-logo';
import { Trash2 } from 'lucide-react';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { CreateDocumentDialog } from '@/components/ui/create-document-dialog';

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
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    docId: string | null;
    title: string;
  }>({
    isOpen: false,
    docId: null,
    title: '',
  });
  const [createDialog, setCreateDialog] = useState(false);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/check-subscription');

        const data = await response.json();
        console.log('Subscription status:', data);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };
    fetchSubscriptionStatus();
  }, []);

  useEffect(() => {
    const fetchUserAndDocuments = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

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
    router.push('/dashboard');
  };

  const handleCreateClick = () => {
    setCreateDialog(true);
  };

  const createNewDocument = async (title: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            title,
            content:
              '\\documentclass{article}\n\\begin{document}\n\nHello LaTeX!\n\n\\end{document}',
            owner_id: session?.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCreateDialog(false);
        router.push(`/editor/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleDeleteClick = (
    docId: string,
    title: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setDeleteDialog({
      isOpen: true,
      docId,
      title,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.docId) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', deleteDialog.docId);

      if (error) throw error;

      setDocuments(documents.filter((doc) => doc.id !== deleteDialog.docId));
      setDeleteDialog({ isOpen: false, docId: null, title: '' });
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <nav className="border-b border-blue-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <OctreeLogo className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-blue-900">Octree</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-blue-600">Welcome, {userName}</span>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-blue-600 hover:bg-blue-50 hover:text-blue-800"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Your Documents</h1>
            <p className="mt-1 text-blue-600">
              Manage and edit your LaTeX documents
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Document
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white">
                <CardHeader>
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <Card className="bg-white p-12 text-center">
            <div className="mb-4 text-blue-600">
              <svg
                className="mx-auto h-16 w-16"
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
            </div>
            <h3 className="mb-2 text-xl font-semibold text-blue-900">
              No documents yet
            </h3>
            <p className="mb-6 text-blue-600">
              Create your first LaTeX document to get started
            </p>
            <Button
              onClick={handleCreateClick}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Create Document
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="group relative cursor-pointer bg-white transition-shadow hover:shadow-lg"
                onClick={() => router.push(`/editor/${doc.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="truncate text-blue-900">
                        {doc.title}
                      </CardTitle>
                      <CardDescription className="text-blue-600">
                        Last updated:{' '}
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-700"
                      onClick={(e) => handleDeleteClick(doc.id, doc.title, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add the delete dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, docId: null, title: '' })
        }
        onConfirm={handleDeleteConfirm}
        title="Delete Document"
        description={`Are you sure you want to delete "${deleteDialog.title}"? This action cannot be undone.`}
      />

      {/* Add the create dialog */}
      <CreateDocumentDialog
        isOpen={createDialog}
        onClose={() => setCreateDialog(false)}
        onConfirm={createNewDocument}
      />
    </div>
  );
}
