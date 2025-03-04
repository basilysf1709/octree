'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/UserContext'
import { Loader2, Save, User as UserIcon } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Profile {
  name: string
  email: string
  avatar_url: string | null
  bio: string
  created_at: string | null
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    name: user?.name || '',
    email: user?.email || '',
    avatar_url: user?.avatar || null,
    bio: '',
    created_at: null
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const supabase = createClientComponentClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single()

        if (error) throw error

        if (data) {
          setProfile(prev => ({
            ...prev,
            ...data,
            name: data.name || user?.name || '',
            email: user?.email || '',
            avatar_url: data.avatar_url || user?.avatar || null,
            created_at: data.created_at
          }))
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchProfile()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const supabase = createClientComponentClient()

      // Update auth user data
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: profile.name }
      })

      if (authError) throw authError

      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          name: profile.name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container max-w-4xl mx-auto p-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon size={40} className="text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile.name || 'Your Profile'}</h1>
              <p className="text-muted-foreground">
                Member since {profile.created_at 
                  ? new Date(profile.created_at).toLocaleDateString() 
                  : 'recently'}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Display Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full p-3 rounded-lg border border-border bg-background/50 text-muted-foreground"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Email can be changed in settings
                </p>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors min-h-[100px]"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-100 border border-green-200 text-green-700' 
                    : 'bg-red-100 border border-red-200 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSaving}
                className="flex items-center"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 