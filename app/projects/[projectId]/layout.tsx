import type React from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { createClient } from "@/lib/supabase/server"
import { BackButton } from "@/components/projects/back-button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { headers } from "next/headers"

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userName = user?.user_metadata?.name ?? user?.email ?? null

  // Get project data for breadcrumbs
  const { data: project } = await supabase
    .from('projects')
    .select('title')
    .eq('id', projectId)
    .eq('user_id', user?.id || '')
    .single()

  // Get current pathname to determine if we're in a file editor
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isFileEditor = pathname.includes('/files/') && pathname.includes('/editor')
  
  // Extract fileId from pathname if we're in file editor
  let fileId = null
  if (isFileEditor) {
    const pathParts = pathname.split('/')
    const fileIndex = pathParts.findIndex(part => part === 'files')
    if (fileIndex !== -1 && pathParts[fileIndex + 1]) {
      fileId = pathParts[fileIndex + 1]
    }
  }
  
  // Get file data if we have a fileId
  let file = null
  if (fileId) {
    const { data: fileData } = await supabase
      .from('files')
      .select('name')
      .eq('id', fileId)
      .eq('project_id', projectId)
      .single()
    file = fileData
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar userName={userName} projectId={projectId} />
      <SidebarInset>
        <header className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="text-muted-foreground">|</span>
            <BackButton />
          </div>
          
          <div className="flex-1 flex justify-center">
            <Breadcrumb>
              <BreadcrumbList className="text-xs gap-1">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isFileEditor ? (
                    <BreadcrumbLink href={`/projects/${projectId}`}>
                      {project?.title || 'Project'}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{project?.title || 'Project'}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {isFileEditor && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{file?.name || 'File'}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="w-32"></div>
        </header>

        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
