import { NextRequest, NextResponse } from 'next/server'
import { getAI } from '@/lib/ai'
import { getAuthClient } from '@/lib/db/route-client'
import { LEARN_MEMORY_PROMPT } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { interaction } = await req.json()

  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!brand) return NextResponse.json({ error: 'No brand profile' }, { status: 400 })

  const ai = getAI()
  const response = await ai.complete([
    { role: 'system', content: LEARN_MEMORY_PROMPT },
    { role: 'user', content: `Extract learnings from this interaction:\n\n${interaction}` }
  ], { json: true, model: 'cheap' })

  try {
    const data = JSON.parse(response)
    const memories = data.memories || []

    if (memories.length > 0) {
      const inserts = memories.map((m: { preference: string; category: string }) => ({
        brand_id: brand.id,
        preference: m.preference,
        category: m.category,
        source: 'ai_extraction',
        confidence: 0.7,
      }))
      await supabase.from('brand_memory').insert(inserts)
    }

    return NextResponse.json({ learned: memories.length, memories })
  } catch {
    return NextResponse.json({ learned: 0, memories: [] })
  }
}
