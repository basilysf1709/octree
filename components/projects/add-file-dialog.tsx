'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Upload, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AddFileDialogProps {
  projectId: string;
  projectTitle: string;
  onFileAdded?: () => void;
}

export function AddFileDialog({ projectId, projectTitle, onFileAdded }: AddFileDialogProps) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'create' | 'upload'>('create');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setUploadMode('upload');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !fileName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Read file content
      const content = await selectedFile.text();

      // Create file record
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .insert({
          project_id: projectId,
          name: fileName,
          type: selectedFile.type || 'text/plain',
          size: selectedFile.size,
        })
        .select()
        .single();

      if (fileError) {
        throw new Error('Failed to create file record');
      }

      // Create document record with file content
      const { error: documentError } = await supabase
        .from('documents')
        .insert({
          title: fileName,
          content: content,
          owner_id: session.user.id,
          project_id: projectId,
          filename: fileName,
          document_type: 'file',
        });

      if (documentError) {
        console.warn('Failed to create document record:', documentError);
      }

      setOpen(false);
      setFileName('');
      setSelectedFile(null);
      setUploadMode('create');
      onFileAdded?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Create file record
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .insert({
          project_id: projectId,
          name: fileName,
          type: 'text/plain',
          size: fileContent.length,
        })
        .select()
        .single();

      if (fileError) {
        throw new Error('Failed to create file record');
      }

      // Create document record if there's content
      if (fileContent.trim()) {
        const { error: documentError } = await supabase
          .from('documents')
          .insert({
            title: fileName,
            content: fileContent,
            owner_id: session.user.id,
            project_id: projectId,
            filename: fileName,
            document_type: 'file',
          });

        if (documentError) {
          console.warn('Failed to create document record:', documentError);
        }
      }

      setOpen(false);
      setFileName('');
      setFileContent('');
      onFileAdded?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = uploadMode === 'upload' ? handleFileUpload : handleCreateFile;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add File to {projectTitle}</DialogTitle>
          <DialogDescription>
            Create a new file or upload an existing file to this project.
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={uploadMode === 'create' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('create')}
            disabled={isLoading}
          >
            <FileText className="h-4 w-4 mr-2" />
            Create New
          </Button>
          <Button
            type="button"
            variant={uploadMode === 'upload' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('upload')}
            disabled={isLoading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>

        {uploadMode === 'create' ? (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name (e.g., document.tex)"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create File'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="fileUpload">Select File</Label>
              <input
                ref={fileInputRef}
                type="file"
                id="fileUpload"
                onChange={handleFileSelect}
                className="hidden"
                accept=".tex,.txt,.md,.json,.js,.ts,.py,.java,.cpp,.c,.html,.css,.xml,.yaml,.yml"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              {selectedFile && (
                <div className="text-sm text-green-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="uploadFileName">File Name (Optional)</Label>
              <Input
                id="uploadFileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter custom name or keep original"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? 'Uploading...' : 'Upload File'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 