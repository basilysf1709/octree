'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  FileText,
  Folder,
  Plus,
  Settings,
  Search,
  Clock,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { OctreeLogo } from '@/components/icons/octree-logo';
// import { SidebarFileUpload } from '@/components/projects/sidebar-file-upload';
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
  files?: ProjectFile[];
}

interface ProjectFile {
  id: string;
  name: string;
  type: string | null;
  size: number | null;
  uploaded_at: string | null;
  project_id: string;
}

export function AppSidebar() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    fetchProjects();
  }, [pathname]); // Refetch when pathname changes

  // Also refetch when the window gains focus (e.g., after file uploads)
  useEffect(() => {
    const handleFocus = () => {
      fetchProjects();
    };

    const handleProjectChange = () => {
      fetchProjects();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('project-deleted', handleProjectChange);
    window.addEventListener('project-created', handleProjectChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('project-deleted', handleProjectChange);
      window.removeEventListener('project-created', handleProjectChange);
    };
  }, []);

  const fetchProjects = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      console.log('Fetching projects for user:', session.user.id);

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (projectsData) {
        console.log('Found projects:', projectsData.map(p => ({ id: p.id, title: p.title })));
        
        // For each project, fetch its files
        const projectsWithContent = await Promise.all(
          projectsData.map(async (project) => {
            console.log('Fetching files for project:', project.id);
            
            // Fetch files for this project
            const { data: files } = await supabase
              .from('files')
              .select('*')
              .eq('project_id', project.id)
              .order('uploaded_at', { ascending: false });

            console.log('Files for project', project.id, ':', files?.map(f => ({ id: f.id, name: f.name })));

            return {
              ...project,
              files: files || [],
            };
          })
        );

        setProjects(projectsWithContent);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };



  const navigateToProject = (projectId: string) => {
    console.log('Navigating to project:', projectId);
    router.push(`/projects/${projectId}`);
  };

  const toggleProject = (projectId: string) => {
    console.log('Toggling project:', projectId);
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      <SidebarContent>
        <SidebarHeader className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3">
            <OctreeLogo className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Octree</h1>
              <p className="text-xs text-gray-500">LaTeX Editor</p>
            </div>
            </a>
          </div
          >
        </SidebarHeader>



        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center justify-between">
              <span>Projects</span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => router.push('/projects')}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No projects yet
                </div>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="group">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => toggleProject(project.id)}
                        className="w-full justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {expandedProjects.has(project.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <Folder className="h-4 w-4" />
                          <span className="truncate">{project.title}</span>
                          <div className="ml-auto flex items-center gap-1">
                            {project.files && project.files.length > 0 && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                                {project.files.length}
                              </span>
                            )}
                            {/* <SidebarFileUpload 
                              projectId={project.id}
                              projectTitle={project.title}
                              onFileUploaded={() => {
                                // Trigger sidebar refresh
                                setTimeout(() => {
                                  window.dispatchEvent(new Event('focus'));
                                }, 100);
                              }}
                            /> */}
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {expandedProjects.has(project.id) && (
                      <div className="ml-6 space-y-1">
                        {/* Files */}
                        {project.files && project.files.length > 0 && (
                          <div className="ml-4">
                            <div className="mb-1 text-xs font-medium text-gray-500">
                              Files
                            </div>
                            {project.files.map((file) => (
                              <SidebarMenuItem key={file.id}>
                                <SidebarMenuButton asChild className="pl-4">
                                  <button
                                    onClick={() => navigateToProject(project.id)}
                                    className="flex w-full items-center gap-2 text-left text-sm"
                                  >
                                    <FileText className="h-3 w-3" />
                                    <span className="truncate">
                                      {file.name}
                                    </span>
                                  </button>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Recent</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.slice(0, 3).map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild className="pl-4">
                    <button
                      onClick={() => navigateToProject(project.id)}
                      className="flex w-full items-center gap-2 text-left text-sm"
                    >
                      <Clock className="h-3 w-3" />
                      <span className="truncate">{project.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/search">
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/settings">
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
