'use client';

import { useState, useActionState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { deleteProject, State } from '@/app/projects/actions/delete-project';

export function DeleteProjectDialog({
  row,
}: {
  row: { id: string; title: string };
}) {
  const [open, setOpen] = useState(false);

  const initialState: State = {
    projectId: null,
    message: null,
    success: false,
  };
  const [state, formAction, isPending] = useActionState(
    deleteProject,
    initialState
  );

  const handleDelete = async () => {
    const formData = new FormData();
    formData.append('projectId', row.id);
    formAction(formData);
  };

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{row.title}"? This action cannot be
            undone and will permanently remove the project and all its files.
          </DialogDescription>
        </DialogHeader>
        {state.message && !state.success && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {state.message}
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
