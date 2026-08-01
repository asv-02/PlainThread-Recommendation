import { NextRequest, NextResponse } from 'next/server'
import { getAI } from '@/lib/ai'
import { getAuthClient } from '@/lib/db/route-client'
import { brandContext, REEL_SCRIPT_PROMPT } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { concept, goal } = await req.json()

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: memories } = await supabase
    .from('brand_memory')
    .select('preference, category')
    .eq('brand_id', brand?.id || '')
    .in('category', ['tone', 'format', 'content'])
    .limit(10)

  const memoryContext = memories?.length
    ? `Brand preferences:\n${memories.map((m: { preference: string }) => `- ${m.preference}`).join('\n')}`
    : ''

  const ai = getAI()
  const response = await ai.complete([
    {
      role: 'system',
      content: `${REEL_SCRIPT_PROMPT}\n\n${brandContext(brand)}\n${memoryContext}`
    },
    {
      role: 'user',
      content: `Create a Reel script for: ${concept}${goal ? `\nGoal: ${goal}` : ''}`
    }
  ], { json: true })

  try {
    const data = JSON.parse(response)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to parse script', raw: response }, { status: 500 })
  }
}
