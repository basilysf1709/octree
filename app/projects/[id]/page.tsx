import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload, FileText, Folder, Download, Trash2, Settings } from 'lucide-react';
import dayjs from 'dayjs';

interface Project {
  id: string;
  title: string;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string | null;
  updated_at: string | null;
  owner_id: string;
  document_type: string | null;
  is_public: boolean | null;
  compile_settings: any;
}

interface ProjectFile {
  id: string;
  name: string;
  type: string | null;
  size: number | null;
  uploaded_at: string | null;
  project_id: string;
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch project details
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    redirect('/projects');
  }

  // Fetch documents for this project (all user documents for now)
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false });

  // Fetch files for this project
  const { data: files } = await supabase
    .from('files')
    .select('*')
    .eq('project_id', params.id)
    .order('uploaded_at', { ascending: false });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-6 border-b">
        <div className="flex items-center gap-4 mb-4">
          <Folder className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{project.title}</h1>
            <p className="text-sm text-neutral-500">
              Created {dayjs(project.created_at).format('MMM D, YYYY')} • 
              Last updated {dayjs(project.updated_at).format('MMM D, YYYY h:mm A')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </CardTitle>
                  <CardDescription>
                    LaTeX documents in this project
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          <div className="text-sm text-gray-500">
                            Updated {dayjs(doc.updated_at).format('MMM D, YYYY h:mm A')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No documents yet</p>
                  <p className="text-sm">Create your first LaTeX document</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Files Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Files
                  </CardTitle>
                  <CardDescription>
                    Uploaded files and resources
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {files && files.length > 0 ? (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Upload className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • 
                            Uploaded {dayjs(file.uploaded_at).format('MMM D, YYYY')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No files uploaded yet</p>
                  <p className="text-sm">Upload images, PDFs, or other resources</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Project Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Project Actions</CardTitle>
              <CardDescription>
                Manage your project settings and collaborators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Project Settings
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Export Project
                </Button>
                <Button variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 