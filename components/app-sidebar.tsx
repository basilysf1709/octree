"use client"

import { Folder, FileText, ChevronDown, DonutIcon as DocumentIcon, FolderOpen } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { UserProfileDropdown } from "@/components/user/user-profile-dropdown"
import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useProjectRefresh } from "@/app/context/project"
import { AddFileDialog } from "@/components/projects/add-file-dialog"
import { usePathname } from "next/navigation"

interface Project {
  id: string
  title: string
  created_at: string | null
  updated_at: string | null
  user_id: string
}

interface File {
  id: string
  name: string
  project_id: string
  size: number | null
  type: string | null
  uploaded_at: string | null
}

interface ProjectWithFiles extends Project {
  files: File[]
}

interface AppSidebarProps {
  userName: string | null
  projectId?: string
}

export function AppSidebar({ userName, projectId }: AppSidebarProps) {
  const [currentProject, setCurrentProject] = useState<ProjectWithFiles | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProjectOpen, setIsProjectOpen] = useState(true)
  const { refreshTrigger } = useProjectRefresh()

  const pathname = usePathname()

  const fetchCurrentProjectAndFiles = useCallback(async () => {
    if (!projectId) return

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) return

      // Fetch the current project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", session.user.id)
        .single()

      if (projectError) {
        console.error("Error fetching project:", projectError)
        return
      }

      // Fetch files for the current project
      const { data: filesData, error: filesError } = await supabase
        .from("files")
        .select("*")
        .eq("project_id", projectId)
        .order("uploaded_at", { ascending: false })

      if (filesError) {
        console.error("Error fetching files for project:", projectId, filesError)
        return
      }

      setCurrentProject({
        ...projectData,
        files: filesData || [],
      })
    } catch (error) {
      console.error("Error fetching project and files:", error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchCurrentProjectAndFiles()
  }, [refreshTrigger, projectId, fetchCurrentProjectAndFiles])

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return <DocumentIcon className="h-4 w-4 text-red-500" />
      case "doc":
      case "docx":
        return <DocumentIcon className="h-4 w-4 text-blue-500" />
      case "txt":
        return <FileText className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="flex items-center gap-2 p-4 border-b border-gray-100">
        <Link
          href="/projects"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {/* <Folder className="h-4 w-4" /> */}
          <span>All Projects</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ) : !currentProject ? (
                <div className="p-6 text-center text-sm text-gray-500">
                  <Folder className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  No project found
                </div>
              ) : (
                <Collapsible open={isProjectOpen} onOpenChange={setIsProjectOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full justify-between hover:bg-gray-50 rounded-lg p-3 group">
                        <div className="flex items-center gap-3">
                          {isProjectOpen ? (
                            <FolderOpen className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Folder className="h-5 w-5 text-gray-500" />
                          )}
                          <span className="font-medium text-gray-900 truncate">{currentProject.title}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-400 transition-transform ${isProjectOpen ? "rotate-180" : ""}`}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>

                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                      {currentProject.files && currentProject.files.length > 0 ? (
                        <>
                          {currentProject.files.map((file) => {
                            const isActive = pathname === `/projects/${currentProject.id}/files/${file.id}/editor`
                            return (
                              <SidebarMenuItem key={file.id}>
                                <SidebarMenuSubButton
                                  asChild
                                  className={`rounded-md transition-all duration-200 ${
                                    isActive
                                      ? "bg-blue-50 text-blue-700 border-l-3 border-blue-500 shadow-sm"
                                      : "hover:bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  <Link
                                    href={`/projects/${currentProject.id}/files/${file.id}/editor`}
                                    className="flex items-center gap-3 p-2 pl-3"
                                  >
                                    {getFileIcon(file.name)}
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm font-medium truncate block">{file.name}</span>
                                      {/* {file.size && (
                                        <span className="text-xs text-gray-400">
                                          {(file.size / 1024).toFixed(1)} KB
                                        </span>
                                      )} */}
                                    </div>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuItem>
                            )
                          })}
                                                     <SidebarMenuItem>
                             <AddFileDialog
                               projectId={currentProject.id}
                               projectTitle={currentProject.title}
                               onFileAdded={fetchCurrentProjectAndFiles}
                             />
                           </SidebarMenuItem>
                        </>
                      ) : (
                        <div className="p-4 text-center">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm text-gray-500 mb-3">No files yet</p>
                          <AddFileDialog
                            projectId={currentProject.id}
                            projectTitle={currentProject.title}
                            onFileAdded={fetchCurrentProjectAndFiles}
                          />
                        </div>
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 p-4">
        <UserProfileDropdown userName={userName} />
      </SidebarFooter>
    </Sidebar>
  )
}
