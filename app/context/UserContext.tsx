'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Dummy auth methods
  const signIn = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const dummyUser = {
      id: '1',
      email,
      name: email.split('@')[0],
      avatar: `https://avatar.vercel.sh/${email}`,
    }
    
    setUser(dummyUser)
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(dummyUser))
    router.push('/') // Redirect to home after login
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('user')
    router.push('/login')
  }

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Protected route handling
  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login')
    }
  }, [user, isLoading, pathname, router])

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 