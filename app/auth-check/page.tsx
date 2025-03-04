'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'

export default function AuthCheckPage() {
  const [authStatus, setAuthStatus] = useState<{
    isLoggedIn: boolean | null;
    userId: string | null;
    email: string | null;
    session: any | null;
    error: string | null;
  }>({
    isLoggedIn: null,
    userId: null,
    email: null,
    session: null,
    error: null
  })
  
  const [apiResponse, setApiResponse] = useState<{
    success: boolean | null;
    data: any | null;
    error: string | null;
  }>({
    success: null,
    data: null,
    error: null
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isApiLoading, setIsApiLoading] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    setIsLoading(true)
    try {
      const supabase = createClientComponentClient()
      
      // Get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      // Get user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (sessionError) {
        setAuthStatus({
          isLoggedIn: false,
          userId: null,
          email: null,
          session: null,
          error: sessionError.message
        })
        return
      }
      
      if (userError) {
        setAuthStatus({
          isLoggedIn: false,
          userId: null,
          email: null,
          session: sessionData.session,
          error: userError.message
        })
        return
      }
      
      setAuthStatus({
        isLoggedIn: !!userData.user,
        userId: userData.user?.id || null,
        email: userData.user?.email || null,
        session: sessionData.session,
        error: null
      })
    } catch (error) {
      setAuthStatus({
        isLoggedIn: false,
        userId: null,
        email: null,
        session: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const testApiEndpoint = async () => {
    setIsApiLoading(true)
    try {
      const res = await fetch('/api/auth-check', {
        method: 'GET'
      })
      
      const data = await res.json()
      
      setApiResponse({
        success: res.ok,
        data,
        error: !res.ok ? data.error || `HTTP error ${res.status}` : null
      })
    } catch (error) {
      setApiResponse({
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsApiLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Authentication Status Check</h1>
      
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold">Client-side Auth Status</h2>
          <Button onClick={checkAuth} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? 'Checking...' : 'Refresh'}
          </Button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          {authStatus.isLoggedIn === null ? (
            <p>Checking authentication status...</p>
          ) : authStatus.isLoggedIn ? (
            <div>
              <p className="text-green-600 font-semibold">✅ Logged In</p>
              <p>User ID: {authStatus.userId}</p>
              <p>Email: {authStatus.email}</p>
              <div className="mt-2">
                <p className="font-semibold">Session Details:</p>
                <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(authStatus.session, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-red-600 font-semibold">❌ Not Logged In</p>
              {authStatus.error && (
                <p className="text-red-500">Error: {authStatus.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold">Server-side Auth Check</h2>
          <Button onClick={testApiEndpoint} disabled={isApiLoading} variant="outline" size="sm">
            {isApiLoading ? 'Testing...' : 'Test API Endpoint'}
          </Button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          {apiResponse.success === null ? (
            <p>Click the button to test the API endpoint</p>
          ) : apiResponse.success ? (
            <div>
              <p className="text-green-600 font-semibold">✅ API Request Successful</p>
              <div className="mt-2">
                <p className="font-semibold">Response:</p>
                <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(apiResponse.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-red-600 font-semibold">❌ API Request Failed</p>
              {apiResponse.error && (
                <p className="text-red-500">Error: {apiResponse.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-yellow-800">Debugging Tips</h3>
        <ul className="list-disc pl-5 mt-2 text-yellow-700 space-y-1">
          <li>Make sure you're logged in (check client-side status above)</li>
          <li>Verify that cookies are being properly set (check Session Details)</li>
          <li>Check that your middleware is correctly configured</li>
          <li>Ensure your RLS policies are set up for authenticated users</li>
        </ul>
      </div>
    </div>
  )
} 