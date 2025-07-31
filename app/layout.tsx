import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { createClient } from '@/lib/supabase/server';
import { ProjectProvider } from '@/lib/project-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Octree',
  description: 'This is a latex editor that uses AI to help you write latex',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName = user?.user_metadata?.name ?? user?.email ?? null;

          return (
          <html lang="en">
            <body className={inter.className}>
              <ProjectProvider>
                <SidebarProvider>
                  <AppSidebar userName={userName} />
                  <SidebarInset>
                    <SidebarTrigger />
                    {children}
                  </SidebarInset>
                </SidebarProvider>
              </ProjectProvider>
              <Analytics />
            </body>
          </html>
        );
}
