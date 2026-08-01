import { NextRequest, NextResponse } from 'next/server'
import { getAI } from '@/lib/ai'
import { getAuthClient } from '@/lib/db/route-client'
import { brandContext, STRATEGY_PROMPT } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: posts } = await supabase
    .from('social_posts')
    .select('id, format, caption, published_at')
    .eq('brand_id', brand?.id || '')
    .order('published_at', { ascending: false })
    .limit(20)

  const postIds = posts?.map((p: Record<string, unknown>) => p.id as string) || []
  const { data: metrics } = postIds.length ? await supabase
    .from('social_post_metrics')
    .select('post_id, reach, likes, comments, saves, shares')
    .in('post_id', postIds) : { data: [] }

  const performanceContext = posts?.map((p: Record<string, unknown>) => {
    const m = metrics?.find((met: Record<string, unknown>) => met.post_id === p.id)
    return `${p.format} | "${((p.caption as string) || '').slice(0, 40)}" | reach:${(m as Record<string, unknown>)?.reach || '?'} likes:${(m as Record<string, unknown>)?.likes || '?'} saves:${(m as Record<string, unknown>)?.saves || '?'}`
  }).join('\n') || 'No performance data yet.'

  const ai = getAI()
  const response = await ai.complete([
    {
      role: 'system',
      content: `${STRATEGY_PROMPT}\n\n${brandContext(brand)}\n\nRecent performance:\n${performanceContext}`
    },
    { role: 'user', content: 'Create a 7-day content strategy based on what works.' }
  ], { json: true })

  try {
    const data = JSON.parse(response)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to parse strategy', raw: response }, { status: 500 })
  }
}
