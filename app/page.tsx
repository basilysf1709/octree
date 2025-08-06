'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { defaultLatexContent } from '@/app/editor/default-content';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/documents/data-table';
import { columns } from '@/components/documents/columns';
import { CreateDocumentDialog } from '@/components/documents/create-document-dialog';
import { DeleteDocumentDialog } from '@/components/documents/delete-document-dialog';
import { Document } from '@/types/document';

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [userName, setUserName] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    docId: string | null;
    title: string;
  }>({
    isOpen: false,
    docId: null,
    title: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUserAndDocuments = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

      setUserName(session.user.user_metadata.name ?? session.user.email);

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setDocuments(data);
      }
    };
    fetchUserAndDocuments();
  }, [router, supabase]);

  const handleCreateClick = () => {
    setCreateDialog(true);
  };

  const createNewDocument = async (title: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            title,
            content: defaultLatexContent,
            owner_id: session.user.id,
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

  const handleDeleteClick = (docId: string, title: string) => {
    setDeleteDialog({
      isOpen: true,
      docId,
      title,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.docId) return;

    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', deleteDialog.docId);

      if (error) throw error;

      setDocuments(documents.filter((doc) => doc.id !== deleteDialog.docId));
      setDeleteDialog({ isOpen: false, docId: null, title: '' });
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar userName={userName} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">
              Documents
            </h1>
            <p className="text-sm text-neutral-500">
              Manage and edit your LaTeX documents
            </p>
          </div>

          <Button size="sm" onClick={handleCreateClick}>
            <PlusIcon />
            New Document
          </Button>
        </div>

        <DataTable
          columns={columns({ onDelete: handleDeleteClick })}
          data={documents}
        />
      </main>

      <DeleteDocumentDialog
        isOpen={deleteDialog.isOpen}
        setIsOpen={(isOpen) => setDeleteDialog((prev) => ({ ...prev, isOpen }))}
        title={deleteDialog.title}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      <CreateDocumentDialog
        isOpen={createDialog}
        onClose={() => setCreateDialog(false)}
        onConfirm={createNewDocument}
      />
    </div>
  );
}
