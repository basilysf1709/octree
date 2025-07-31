'use client';

import { useEffect, useState } from 'react';
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
import { Project, SelectedProject } from '@/types/project';
import { useProjectRefresh } from '@/lib/project-context';
import { useDeleteProject } from '@/app/projects/actions/delete-project-client';

export function ProjectsTable({ data }: { data: Project[] }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<SelectedProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshProjects } = useProjectRefresh();
  const { deleteProjectWithRefresh } = useDeleteProject();

  const handleDeleteClick = (projectId: string, projectTitle: string) => {
    setSelectedProject({
      id: projectId,
      title: projectTitle,
    });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;

    setIsLoading(true);
    setError(null);

    const result = await deleteProjectWithRefresh(selectedProject.id);

    if (result.success) {
      closeDialog();
      // Refresh the projects list
      window.location.reload();
    } else {
      setError(result.message || 'Failed to delete project');
    }

    setIsLoading(false);
  };

  const closeDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedProject(null);
    setError(null);
  };

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
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
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
