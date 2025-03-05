import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export async function DELETE(
  request: NextRequest,
) {
  try {
    const id = request.url.split('/').pop()
    console.log('id', id)
    const supabase = createServerComponentClient({ cookies })
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Delete the document
    const res = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('author_id', user.id) // Ensure user owns the document
      .single()
    
    if (res.error) {
      return NextResponse.json({ error: res.error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
} 