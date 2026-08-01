import { NextRequest, NextResponse } from 'next/server'
import { getAI } from '@/lib/ai'
import { getAuthClient } from '@/lib/db/route-client'
import { brandContext, COMPETITOR_ANALYSIS_PROMPT } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { competitor_id } = await req.json()

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const query = supabase.from('competitor_posts').select('*')
  if (competitor_id) {
    query.eq('competitor_id', competitor_id)
  }
  const { data: posts } = await query.order('created_at', { ascending: false }).limit(30)

  if (!posts?.length) {
    return NextResponse.json({ error: 'No competitor posts to analyze. Add some posts first.' }, { status: 400 })
  }

  const postsContext = posts.map((p: Record<string, string | null>) =>
    `Format: ${p.format} | Topic: ${p.topic || 'N/A'} | Hook: ${p.hook || 'N/A'} | Pillar: ${p.content_pillar || 'N/A'} | Engagement: ${p.estimated_engagement || 'N/A'}`
  ).join('\n')

  const ai = getAI()
  const response = await ai.complete([
    {
      role: 'system',
      content: `${COMPETITOR_ANALYSIS_PROMPT}\n\n${brandContext(brand)}\n\nCompetitor posts to analyze:\n${postsContext}`
    },
    { role: 'user', content: 'Analyze these competitor posts and find patterns and opportunities for my brand.' }
  ], { json: true })

  try {
    const data = JSON.parse(response)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to parse analysis', raw: response }, { status: 500 })
  }
}
