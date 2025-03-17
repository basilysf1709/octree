import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { logToFile } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  logToFile('Callback route hit');
  
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  logToFile('Auth code check', { hasCode: !!code });

  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      logToFile('Attempting to exchange code for session');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      logToFile('Exchange result', { success: !!data, error });

      if (error) throw error;

      logToFile('Redirecting to dashboard');
      return NextResponse.redirect('http://localhost:3000/dashboard');
      
    } catch (error) {
      logToFile('Auth error occurred', { error });
      return NextResponse.redirect('http://localhost:3000/auth?error=auth_failed');
    }
  }

  logToFile('No code found, redirecting to auth');
  return NextResponse.redirect('http://localhost:3000/auth?error=no_code');
} 