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
  if (!brand) return NextResponse.json({ memories: [] })

  const { data } = await supabase
    .from('brand_memory')
    .select('*')
    .eq('brand_id', brand.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ memories: data || [] })
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

  const { preference, category } = await req.json()
  if (!preference || !category) {
    return NextResponse.json({ error: 'preference and category required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('brand_memory')
    .insert({
      brand_id: brand.id,
      preference,
      category,
      source: 'manual',
      confidence: 1.0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ memory: data })
}

export async function DELETE(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await supabase.from('brand_memory').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
