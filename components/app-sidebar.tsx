'use client';

import {
  Folder,
  Plus,
  User,
  FileText,
  ChevronDown,
  Settings,
  LogOut,
  Receipt,
  FileText as DocumentIcon,
  Minus,
  PlusIcon,
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
import { useProjectRefresh } from '@/lib/project-context';
import { useCreateProject } from '@/app/projects/actions/create-project-client';

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

const settings = [
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
  {
    title: 'Billing',
    url: '/billing',
    icon: Receipt,
  },
];

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
  useEffect(() => {
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
    } else {
      setError(result.message || 'Failed to create project');
    }

    setIsLoading(false);
  };
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-2 p-4">
        <img src="/octree.svg" alt="Octree Logo" className="h-16 w-16" />
        <span className="text-lg font-semibold">Octree</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Documents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <DocumentIcon />
                    <span>All Documents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
                {/* <Button size="sm" className> */}
                <Plus />
                {/* New Project */}
                {/* </Button> */}
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
                          {project.files && project.files.length > 0 && (
                            <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {project.files && project.files.length > 0 && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {project.files.map((file) => (
                              <SidebarMenuItem key={file.id}>
                                <SidebarMenuSubButton asChild>
                                  <Link
                                    href={`/projects/${project.id}/files/${file.id}`}
                                  >
                                    <FileText />
                                    <span>{file.name}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settings.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
