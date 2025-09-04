'use client';

import {
  Folder,
  Plus,
  FileText,
  ChevronDown,
  FileText as DocumentIcon,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupAction,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { UserProfileDropdown } from '@/components/user/user-profile-dropdown';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useProjectRefresh } from '@/app/context/project';
import { useCreateProject } from '@/hooks/create-project-client';
import { AddFileDialog } from '@/components/projects/add-file-dialog';
import { usePathname } from 'next/navigation';

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
import { Label } from './ui/label';
import { Input } from './ui/input';
interface Project {
  id: string;
  title: string;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
}

interface File {
  id: string;
  name: string;
  project_id: string;
  size: number | null;
  type: string | null;
  uploaded_at: string | null;
}

interface ProjectWithFiles extends Project {
  files: File[];
}



interface AppSidebarProps {
  userName: string | null;
}

export function AppSidebar({ userName }: AppSidebarProps) {
  const [projects, setProjects] = useState<ProjectWithFiles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshTrigger } = useProjectRefresh();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { createProjectWithRefresh } = useCreateProject();
  const pathname = usePathname();

  const fetchProjectsAndFiles = async () => {
    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Fetch projects for the current user
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return;
      }

      // Fetch files for each project
      const projectsWithFiles: ProjectWithFiles[] = [];

      for (const project of projectsData || []) {
        const { data: filesData, error: filesError } = await supabase
          .from('files')
          .select('*')
          .eq('project_id', project.id)
          .order('uploaded_at', { ascending: false });

        if (filesError) {
          console.error(
            'Error fetching files for project:',
            project.id,
            filesError
          );
        }

        projectsWithFiles.push({
          ...project,
          files: filesData || [],
        });
      }

      setProjects(projectsWithFiles);
    } catch (error) {
      console.error('Error fetching projects and files:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchProjectsAndFiles();
  }, [refreshTrigger]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', title);

    const result = await createProjectWithRefresh(formData);

    if (result.success) {
      setOpen(false);
      setTitle('');
      // Refresh projects list after successful creation
      await fetchProjectsAndFiles();
    } else {
      setError(result.message || 'Failed to create project');
    }

    setIsLoading(false);
  };
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-2 p-4">
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/projects">
                    <Folder />
                    <span>All Projects</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroupAction title="New Project">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
              <Plus />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <DialogHeader>
                    <DialogTitle>New Project</DialogTitle>
                    <DialogDescription>
                      Create a new project to get started.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-3">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter project title"
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" disabled={isLoading}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="p-4 text-center text-sm text-neutral-500">
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="p-4 text-center text-sm text-neutral-500">
                  No projects found
                </div>
              ) : (
                projects.map((project) => (
                  <Collapsible key={project.id} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <Folder />
                          <span>{project.title}</span>
                          <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {project.files && project.files.length > 0 && (
                            <>
                              {project.files.map((file) => {
                                const isActive = pathname === `/projects/${project.id}/files/${file.id}/editor`;
                                return (
                                  <SidebarMenuItem key={file.id}>
                                    <SidebarMenuSubButton 
                                      asChild
                                      className={isActive ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' : ''}
                                    >
                                      <Link
                                        href={`/projects/${project.id}/files/${file.id}/editor`}
                                      >
                                        <FileText />
                                        <span>{file.name}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuItem>
                                );
                              })}
                              <SidebarMenuItem>
                                <SidebarMenuSubButton asChild>
                                  <AddFileDialog 
                                    projectId={project.id} 
                                    projectTitle={project.title}
                                    onFileAdded={fetchProjectsAndFiles}
                                  />
                                </SidebarMenuSubButton>
                              </SidebarMenuItem>
                            </>
                          )}
                          {(!project.files || project.files.length === 0) && (
                            <SidebarMenuItem>
                              <SidebarMenuSubButton asChild>
                                <AddFileDialog 
                                  projectId={project.id} 
                                  projectTitle={project.title}
                                  onFileAdded={fetchProjectsAndFiles}
                                />
                              </SidebarMenuSubButton>
                            </SidebarMenuItem>
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <UserProfileDropdown userName={userName} />
      </SidebarFooter>
    </Sidebar>
  );
}
