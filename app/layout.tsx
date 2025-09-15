import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { ProjectProvider } from '@/app/context/project';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Octree',
  description: 'A latex editor that uses AI to help you write latex',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProjectProvider>{children}</ProjectProvider>
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
