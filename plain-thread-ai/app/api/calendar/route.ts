import { NextRequest, NextResponse } from 'next/server'
import { getAuthClient } from '@/lib/db/route-client'

export async function GET(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!brand) return NextResponse.json({ entries: [] })

  const from = req.nextUrl.searchParams.get('from')
  const to = req.nextUrl.searchParams.get('to')

  let query = supabase
    .from('content_calendar')
    .select('*, content_ideas(title, format)')
    .eq('brand_id', brand.id)

  if (from) query = query.gte('date', from)
  if (to) query = query.lte('date', to)

  const { data } = await query.order('date', { ascending: true })
  return NextResponse.json({ entries: data || [] })
}

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!brand) return NextResponse.json({ error: 'Set up brand first' }, { status: 400 })

  const body = await req.json()

  const { data: entry, error } = await supabase
    .from('content_calendar')
    .insert({
      brand_id: brand.id,
      idea_id: body.idea_id || null,
      date: body.date,
      platform: body.platform || 'instagram',
      content_type: body.content_type,
      status: body.status || 'idea',
      caption: body.caption || null,
      script: body.script || null,
      scheduled_time: body.scheduled_time || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ entry })
}

export async function PATCH(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('content_calendar')
    .update({
      ...(body.date && { date: body.date }),
      ...(body.status && { status: body.status }),
      ...(body.content_type && { content_type: body.content_type }),
      ...(body.caption !== undefined && { caption: body.caption }),
      ...(body.script !== undefined && { script: body.script }),
    })
    .eq('id', body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
