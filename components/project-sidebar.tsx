'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  Plus,
  Upload,
  Settings,
  Search,
  Clock,
  Star,
  Trash2,
  Download,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { OctreeLogo } from '@/components/icons/octree-logo';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';

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

interface ProjectSidebarProps {
  projectId: string;
}

export function ProjectSidebar({ projectId }: ProjectSidebarProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['documents', 'files'])
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch project details
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', session.user.id)
        .single();

      if (projectData) {
        setProject(projectData);
      }

      // Fetch documents for this project (all user documents for now)
      const { data: documentsData } = await supabase
        .from('documents')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (documentsData) {
        setDocuments(documentsData);
      }

      // Fetch files for this project
      const { data: filesData } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (filesData) {
        setFiles(filesData);
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const navigateToDocument = (documentId: string) => {
    router.push(`/editor/${documentId}`);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Sidebar>
        <SidebarContent>
          <div className="p-4">
            <div className="animate-pulse">
              <div className="mb-2 h-4 rounded bg-gray-200"></div>
              <div className="mb-2 h-4 rounded bg-gray-200"></div>
              <div className="h-4 rounded bg-gray-200"></div>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarContent className="space-y-6">
        <SidebarHeader className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <OctreeLogo className="h-10 w-10" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Octree</h1>
              <p className="text-xs text-gray-500">LaTeX Editor</p>
            </div>
          </div>
        </SidebarHeader>

        {project && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-gray-600 mb-3">
              Project: {project.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2 text-xs text-gray-500">
                Created {formatDate(project.created_at)}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-600 mb-3">
            <div className="flex items-center justify-between">
              <span>Documents</span>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-100">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {documents.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 italic">
                  No documents yet
                </div>
              ) : (
                documents.map((doc) => (
                  <SidebarMenuItem key={doc.id}>
                    <SidebarMenuButton asChild className="rounded-lg">
                      <button
                        onClick={() => navigateToDocument(doc.id)}
                        className="flex w-full items-center gap-2 text-left text-sm px-3 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{doc.title}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {formatDate(doc.updated_at)}
                          </div>
                        </div>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-600 mb-3">
            <div className="flex items-center justify-between">
              <span>Files</span>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-100">
                <Upload className="h-3 w-3" />
              </Button>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {files.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 italic">
                  No files uploaded
                </div>
              ) : (
                files.map((file) => (
                  <SidebarMenuItem key={file.id}>
                    <SidebarMenuButton asChild className="rounded-lg">
                      <button className="flex w-full items-center gap-2 text-left text-sm px-3 py-2 hover:bg-gray-50 transition-colors">
                        <Upload className="h-3 w-3" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{file.name}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {formatFileSize(file.size)} • {formatDate(file.uploaded_at)}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-600 mb-3">Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="rounded-lg">
                  <a href="/search" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors">
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="rounded-lg">
                  <a href="/settings" className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
} 