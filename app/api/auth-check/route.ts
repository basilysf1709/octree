import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export async function GET() {
  try {
    // Create a Supabase client using the auth-helpers-nextjs package
    const supabase = createServerComponentClient({ cookies })
    
    // Get the user from the session
    const { data, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ 
        authenticated: false,
        error: 'Authentication error', 
        details: authError.message 
      }, { status: 401 })
    }
    
    if (!data.user) {
      console.error('No user found in session')
      return NextResponse.json({ 
        authenticated: false,
        error: 'Not authenticated', 
        details: 'No user found in session' 
      }, { status: 401 })
    }
    
    // User is authenticated
    return NextResponse.json({
      authenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      message: 'Authentication successful'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      authenticated: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 