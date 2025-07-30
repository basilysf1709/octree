'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
// import { FileUpload } from './file-upload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ProjectFile {
  id: string;
  name: string;
  size: number | null;
  type: string | null;
  uploaded_at: string | null;
  project_id: string;
}

interface FileManagerProps {
  projectId: string;
  onFilesChanged?: () => void;
}

export function FileManager({ projectId, onFilesChanged }: FileManagerProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = createClient();

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching files:', error);
        return;
      }

      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const handleFileUploaded = () => {
    fetchFiles();
    // Notify parent component that files have changed
    onFilesChanged?.();
    // Trigger focus event to update sidebar
    setTimeout(() => {
      window.dispatchEvent(new Event('focus'));
    }, 100);
  };

  const removeFile = async (fileId: string) => {
    try {
      // Get file info before deleting
      const fileToDelete = files.find(f => f.id === fileId);
      if (!fileToDelete) return;

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) {
        console.error('Error deleting file record:', dbError);
        return;
      }

      // Try to delete from storage (optional - storage cleanup)
      try {
        const timestamp = fileToDelete.uploaded_at ? new Date(fileToDelete.uploaded_at).getTime() : Date.now();
        const fileName = `${timestamp}-${fileToDelete.name}`;
        const filePath = `projects/${projectId}/files/${fileName}`;
        
        await supabase.storage
          .from('octree')
          .remove([filePath]);
      } catch (storageError) {
        console.warn('Could not delete file from storage:', storageError);
      }

      // Refresh files list
      fetchFiles();
      // Notify parent component that files have changed
      onFilesChanged?.();
      // Trigger focus event to update sidebar
      setTimeout(() => {
        window.dispatchEvent(new Event('focus'));
      }, 100);
    } catch (error) {
      console.error('Error removing file:', error);
    }
  };

  const getFileUrl = (file: ProjectFile) => {
    // Generate the file path based on upload timestamp and filename
    const timestamp = file.uploaded_at ? new Date(file.uploaded_at).getTime() : Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `projects/${projectId}/files/${fileName}`;
    
    const { data } = supabase.storage
      .from('octree')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = async (file: ProjectFile) => {
    try {
      const url = getFileUrl(file);
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Project Files</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
              <DialogDescription>
                Upload files to your project. Files will be stored securely and can be accessed by anyone with the project link.
              </DialogDescription>
            </DialogHeader>
            {/* <FileUpload 
              projectId={projectId} 
              onFileUploaded={() => {
                handleFileUploaded();
                setIsDialogOpen(false);
              }}
            /> */}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>No files uploaded yet</p>
          <p className="text-sm">Upload files to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(getFileUrl(file), '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadFile(file)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(file.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 