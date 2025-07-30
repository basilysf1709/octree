'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { deleteProject, State } from '@/app/projects/actions/delete-project';
import { Project, SelectedProject } from '@/types/project';

export function ProjectsTable({ data }: { data: Project[] }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<SelectedProject | null>(null);

  const initialState: State = {
    projectId: null,
    message: null,
    success: false,
  };
  const [state, formAction, pending] = useActionState(
    deleteProject,
    initialState
  );

  const handleDeleteClick = (projectId: string, projectTitle: string) => {
    setSelectedProject({
      id: projectId,
      title: projectTitle,
    });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;

    const formData = new FormData();
    formData.append('projectId', selectedProject.id);
    startTransition(() => {
      formAction(formData);
    });
  };

  const closeDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  useEffect(() => {
    if (state.success) {
      closeDialog();
      // Dispatch custom event to notify sidebar to refresh
      window.dispatchEvent(new CustomEvent('project-deleted'));
    }
  }, [state]);

  return (
    <>
      <DataTable
        columns={columns({ onDelete: handleDeleteClick })}
        data={data}
      />
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(isOpen) => setIsDeleteDialogOpen(isOpen)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedProject?.title}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} disabled={pending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
