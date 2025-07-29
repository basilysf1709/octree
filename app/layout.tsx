import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Octree',
  description: 'This is a latex editor that uses AI to help you write latex',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <SidebarProvider>
        <body className={inter.className}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <SidebarInset className="flex-1 flex flex-col min-w-0">
              <SidebarTrigger />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </SidebarInset>
          </div>
          <Analytics />
        </body>
      </SidebarProvider>
    </html>
  );
}
