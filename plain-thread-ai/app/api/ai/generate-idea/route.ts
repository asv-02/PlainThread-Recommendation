import { NextRequest, NextResponse } from 'next/server'
import { getAI } from '@/lib/ai'
import { getAuthClient } from '@/lib/db/route-client'

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { goal } = await req.json()

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const ai = getAI()
  const response = await ai.complete([
    {
      role: 'system',
      content: `You are a creative social media strategist for ${brand?.name || 'a fashion brand'}.
Brand: ${brand?.description || 'N/A'}
Target audience: ${brand?.target_audience || 'N/A'}
Tone: ${brand?.tone_of_voice || 'N/A'}
Values: ${brand?.brand_values?.join(', ') || 'N/A'}

Generate 3 content ideas. For each, provide: title, format (reel/carousel/single_post/story), content_pillar (lifestyle/educational/brand_story/product/community), hook, concept, why_it_might_work, confidence_score (0-100).

Return valid JSON: { "ideas": [...] }`
    },
    {
      role: 'user',
      content: goal ? `Goal: ${goal}` : 'Generate 3 high-potential content ideas for this brand.'
    }
  ], { json: true })

  try {
    const data = JSON.parse(response)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ ideas: [], raw: response })
  }
}
