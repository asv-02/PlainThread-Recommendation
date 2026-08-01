import { NextRequest, NextResponse } from 'next/server'
import { getAI } from '@/lib/ai'
import { getAuthClient } from '@/lib/db/route-client'
import { brandContext, DAILY_BRIEF_PROMPT } from '@/lib/ai/prompts'

export async function GET(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: recentPosts } = await supabase
    .from('social_posts')
    .select('format, caption, published_at')
    .eq('brand_id', brand?.id || '')
    .order('published_at', { ascending: false })
    .limit(5)

  const { data: recentIdeas } = await supabase
    .from('content_ideas')
    .select('title, format, status')
    .eq('brand_id', brand?.id || '')
    .order('created_at', { ascending: false })
    .limit(5)

  const postsContext = recentPosts?.length
    ? `Recent posts: ${recentPosts.map((p: Record<string, string | null>) => `${p.format}: "${(p.caption || '').slice(0, 50)}"`).join('; ')}`
    : 'No recent posts yet.'

  const ideasContext = recentIdeas?.length
    ? `Recent ideas: ${recentIdeas.map((i: Record<string, string | null>) => `${i.title} (${i.status})`).join('; ')}`
    : ''

  const ai = getAI()
  const response = await ai.complete([
    {
      role: 'system',
      content: `${DAILY_BRIEF_PROMPT}\n\n${brandContext(brand)}\n\n${postsContext}\n${ideasContext}`
    },
    { role: 'user', content: 'Generate my daily content brief for today.' }
  ], { json: true, model: 'cheap' })

  try {
    const data = JSON.parse(response)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to parse brief', raw: response }, { status: 500 })
  }
}
