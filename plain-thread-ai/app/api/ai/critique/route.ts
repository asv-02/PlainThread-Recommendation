import { NextRequest, NextResponse } from 'next/server'
import { getAI } from '@/lib/ai'
import { getAuthClient } from '@/lib/db/route-client'

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { idea } = await req.json()

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const ai = getAI()
  const response = await ai.complete([
    {
      role: 'system',
      content: `You are a brutally honest social media content critic for ${brand?.name || 'a fashion brand'}.
Brand: ${brand?.description || 'N/A'}
Target audience: ${brand?.target_audience || 'N/A'}
Tone: ${brand?.tone_of_voice || 'N/A'}

Score the idea and provide actionable feedback.
Return valid JSON:
{
  "critique": {
    "overall_score": number (1-10),
    "brand_fit": number (1-10),
    "novelty": number (1-10),
    "hook_strength": number (1-10),
    "shareability": number (1-10),
    "sales_potential": number (1-10),
    "risk_level": "low" | "medium" | "high",
    "strengths": string[],
    "weaknesses": string[],
    "suggestions": string[],
    "alternative_angle": string | null
  }
}`
    },
    { role: 'user', content: `Critique this content idea:\n\n${idea}` }
  ], { json: true })

  try {
    const data = JSON.parse(response)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ critique: null, raw: response })
  }
}
