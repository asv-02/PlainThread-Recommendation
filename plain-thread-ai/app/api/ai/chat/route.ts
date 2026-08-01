import { NextRequest, NextResponse } from 'next/server'
import { getAI } from '@/lib/ai'
import { getAuthClient } from '@/lib/db/route-client'

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages } = await req.json()

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: memories } = await supabase
    .from('brand_memory')
    .select('preference, category')
    .eq('brand_id', brand?.id || '')
    .limit(20)

  const memoryContext = memories?.map((m: { preference: string }) => `- ${m.preference}`).join('\n') || 'No preferences recorded yet.'

  const ai = getAI()
  const systemPrompt = `You are the AI social media manager for ${brand?.name || 'Plain Thread'}.
Brand: ${brand?.description || 'N/A'}
Mission: ${brand?.mission || 'N/A'}
Audience: ${brand?.target_audience || 'N/A'}
Tone: ${brand?.tone_of_voice || 'N/A'}
Values: ${brand?.brand_values?.join(', ') || 'N/A'}

Brand preferences/memory:
${memoryContext}

You help with content strategy, ideas, captions, scripts, and social media growth. Be specific, data-driven when possible, and always stay aligned with the brand.`

  const response = await ai.complete([
    { role: 'system', content: systemPrompt },
    ...messages,
  ])

  return NextResponse.json({ message: response })
}
