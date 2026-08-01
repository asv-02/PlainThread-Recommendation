import { NextRequest, NextResponse } from 'next/server'
import { getAI } from '@/lib/ai'
import { getAuthClient } from '@/lib/db/route-client'
import { brandContext, SHOT_LIST_PROMPT } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { concept, format } = await req.json()

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const ai = getAI()
  const response = await ai.complete([
    {
      role: 'system',
      content: `${SHOT_LIST_PROMPT}\n\n${brandContext(brand)}`
    },
    {
      role: 'user',
      content: `Create a shot list for a ${format || 'reel'}: ${concept}`
    }
  ], { json: true })

  try {
    const data = JSON.parse(response)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to parse shot list', raw: response }, { status: 500 })
  }
}
