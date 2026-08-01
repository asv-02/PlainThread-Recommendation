import { createClient } from '@/lib/db/client'

/**
 * Fetch wrapper that automatically attaches the Supabase auth token.
 * Use this for all API calls from client components.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  return fetch(url, { ...options, headers })
}
