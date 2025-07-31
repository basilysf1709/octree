'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { DataTable } from '@/components/documents/data-table';
import { columns } from '@/components/documents/columns';
import { Loader2, PlusIcon } from 'lucide-react';
import { Document } from '@/types/document';
import { CreateDocumentDialog } from '@/components/ui/create-document-dialog';
import { defaultLatexContent } from '@/app/editor/default-content';
import { useProjectRefresh } from '@/lib/project-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  const { refreshProjects } = useProjectRefresh();

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
        .select(`
          *,
          projects!documents_project_id_fkey (
            id,
            title
          )
        `)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setDocuments(data);
      }
    };
    fetchUserAndDocuments();
    // Refresh sidebar projects when page loads
    refreshProjects();
  }, [router, supabase, refreshProjects]);

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
      alert('Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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

      <Dialog
        open={deleteDialog.isOpen}
        onOpenChange={(isOpen) =>
          !isDeleting && setDeleteDialog((prev) => ({ ...prev, isOpen }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteDialog.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() =>
                setDeleteDialog({ isOpen: false, docId: null, title: '' })
              }
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateDocumentDialog
        isOpen={createDialog}
        onClose={() => setCreateDialog(false)}
        onConfirm={createNewDocument}
      />
    </>
  );
}
