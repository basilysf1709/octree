'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function AuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClientComponentClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      setIsLoggedIn(!!user)
      setUserId(user?.id || null)
      
      console.log('Auth check:', { user })
    }
    
    checkAuth()
  }, [])

  if (isLoggedIn === null) return <div>Checking authentication...</div>

  return (
    <div className="p-4 bg-gray-100 rounded mb-4">
      <h2 className="font-bold">Authentication Status</h2>
      <p>Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'}</p>
      {userId && <p>User ID: {userId}</p>}
    </div>
  )
} 