'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useRouter, usePathname } from 'next/navigation'

const PUBLIC_PATHS = ['/login', '/signup', '/']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [pathname])

  async function checkAuth() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      setAuthenticated(true)
      if (pathname === '/login' || pathname === '/signup') {
        router.replace('/dashboard')
        return
      }
    } else {
      setAuthenticated(false)
      if (!PUBLIC_PATHS.includes(pathname)) {
        router.replace('/login')
        return
      }
    }
    setChecked(true)
  }

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}
