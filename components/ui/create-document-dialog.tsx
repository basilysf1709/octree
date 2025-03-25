'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from './button';

interface CreateDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => void;
}

export function CreateDocumentDialog({ isOpen, onClose, onConfirm }: CreateDocumentDialogProps) {
  const [title, setTitle] = useState('Untitled Document');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(title);
    setTitle('Untitled Document'); // Reset for next time
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[400px] p-6 animate-in fade-in zoom-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-full">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-900">Create New Document</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-blue-900 mb-2">
              Document Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 