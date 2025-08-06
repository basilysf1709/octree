'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface CreateDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => void;
}

export function CreateDocumentDialog({
  isOpen,
  onClose,
  onConfirm,
}: CreateDocumentDialogProps) {
  const [title, setTitle] = useState('Untitled Document');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(title);
    setTitle('Untitled Document');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <FileText className="size-5 text-blue-600" />
            </div>
            <DialogTitle>Create New Document</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-blue-900"
            >
              Document Title
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-blue-600 hover:bg-blue-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
