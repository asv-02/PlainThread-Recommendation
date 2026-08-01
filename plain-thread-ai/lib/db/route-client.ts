import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Get an authenticated Supabase client from API route request.
 * Reads the Bearer token from the Authorization header.
 * Returns { supabase, user } or { supabase: null, user: null } if unauthorized.
 */
export async function getAuthClient(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return { supabase: null, user: null }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase: any = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { supabase: null, user: null }
  }

  return { supabase, user }
}
