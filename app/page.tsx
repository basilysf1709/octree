'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to projects page
    router.push('/projects');
  }, [router]);

  return null; // This component will redirect, so no need to render anything
}
