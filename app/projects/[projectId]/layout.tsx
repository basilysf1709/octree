import type React from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { createClient } from "@/lib/supabase/server"
import { BackButton } from "@/components/projects/back-button"

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { projectId: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userName = user?.user_metadata?.name ?? user?.email ?? null

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar userName={userName} projectId={params.projectId} />
      <SidebarInset>
        <header className="flex items-center gap-2 border-b px-4 py-2">
          <SidebarTrigger />
          <div className="flex items-center ">
            <span className="text-muted-foreground">|</span>
            <BackButton />
          </div>
        </header>

        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
