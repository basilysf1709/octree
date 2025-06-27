'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createProject, State } from '@/app/projects/actions/create-project';

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);

  const initialState: State = { projectId: null, message: null };
  const [state, formAction, pending] = useActionState(
    createProject,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>
              Create a new project to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" />
            {state.message && (
              <p className="text-sm text-red-600">{state.message}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
