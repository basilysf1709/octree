import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    
    // Create a Supabase client using the auth-helpers-nextjs package
    const supabase = createServerComponentClient({ cookies })
    
    console.log('Attempting to get user from session...')
    const { data, error: authError } = await supabase.auth.getUser()
    
    console.log('Auth response:', { 
      user: data?.user ? { id: data.user.id, email: data.user.email } : null,
      error: authError 
    })
    
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ 
        error: 'Authentication error', 
        details: authError.message 
      }, { status: 401 })
    }
    
    if (!data.user) {
      console.error('No user found in session')
      return NextResponse.json({ 
        error: 'Not authenticated', 
        details: 'No user found in session' 
      }, { status: 401 })
    }
    
    console.log('User authenticated:', data.user.id)
    
    const { data: insertData, error: insertError } = await supabase
      .from('documents')
      .insert([{ 
        name,
        author_id: data.user.id 
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json({ 
        error: insertError.message,
        details: insertError.details 
      }, { status: 500 })
    }

    return NextResponse.json(insertData)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 