import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/db/server-client'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  // Show cookie values (truncated for security)
  const cookieInfo = allCookies.map(c => ({
    name: c.name,
    valueLength: c.value.length,
    valuePreview: c.value.substring(0, 50),
  }))

  const supabase = await createServerSupabaseClient()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  return NextResponse.json({
    cookies: cookieInfo,
    hasSession: !!session,
    sessionError: sessionError?.message || null,
    hasUser: !!user,
    userError: userError?.message || null,
    userId: user?.id || null,
  })
}
