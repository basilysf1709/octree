'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from './button';

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(title);
    setTitle('Untitled Document'); // Reset for next time
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="animate-in fade-in zoom-in w-[400px] rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-900">
            Create New Document
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-blue-900"
            >
              Document Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-blue-200 px-3 py-2 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoFocus
              required
            />
          </div>

          <div className="flex justify-end gap-3">
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
          </div>
        </form>
      </div>
    </div>
  );
}
