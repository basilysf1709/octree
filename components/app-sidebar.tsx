import { Folder, Plus, User, FileText, ChevronDown, Settings, LogOut, Receipt } from "lucide-react"
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
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { UserProfileDropdown } from "@/components/user/user-profile-dropdown"

// Sample data for projects and settings
const projects = [
  {
    title: "My First Project",
    url: "#",
    icon: Folder,
    files: [
      { title: "main.tex", url: "#", icon: FileText },
      { title: "references.bib", url: "#", icon: FileText },
      { title: "image.png", url: "#", icon: FileText },
    ],
  },
  {
    title: "Research Paper",
    url: "#",
    icon: Folder,
    files: [
      { title: "paper.tex", url: "#", icon: FileText },
      { title: "figures.zip", url: "#", icon: FileText },
    ],
  },
  {
    title: "Thesis Draft",
    url: "#",
    icon: Folder,
    files: [
      { title: "chapter1.tex", url: "#", icon: FileText },
      { title: "chapter2.tex", url: "#", icon: FileText },
      { title: "appendix.tex", url: "#", icon: FileText },
    ],
  },
]

const settings = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: Receipt,
  },
]

interface AppSidebarProps {
  userName: string | null;
}

export function AppSidebar({ userName }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-2 p-4">
        <img src="/octree.svg" alt="Octree Logo" className="h-8 w-8" />
        <span className="text-lg font-semibold">Octree</span>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupAction title="New Project">
            <Plus />
            <span className="sr-only">New Project</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <Collapsible key={project.title} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <project.icon />
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
                            <SidebarMenuItem key={file.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={file.url}>
                                  <file.icon />
                                  <span>{file.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
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
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
  )
}
