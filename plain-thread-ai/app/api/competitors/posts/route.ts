import { NextRequest, NextResponse } from 'next/server'
import { getAuthClient } from '@/lib/db/route-client'

export async function GET(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const competitorId = req.nextUrl.searchParams.get('competitor_id')

  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!brand) return NextResponse.json({ posts: [] })

  const { data: competitors } = await supabase
    .from('competitors')
    .select('id')
    .eq('brand_id', brand.id)

  const competitorIds = competitors?.map((c: Record<string, unknown>) => c.id as string) || []
  if (competitorIds.length === 0) return NextResponse.json({ posts: [] })

  let query = supabase.from('competitor_posts').select('*, competitors(name)')
  if (competitorId) {
    query = query.eq('competitor_id', competitorId)
  } else {
    query = query.in('competitor_id', competitorIds)
  }

  const { data: posts } = await query.order('created_at', { ascending: false })
  return NextResponse.json({ posts: posts || [] })
}

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if (!body.competitor_id || !body.format) {
    return NextResponse.json({ error: 'competitor_id and format are required' }, { status: 400 })
  }

  const { data: post, error } = await supabase
    .from('competitor_posts')
    .insert({
      competitor_id: body.competitor_id,
      format: body.format,
      topic: body.topic || null,
      hook: body.hook || null,
      content_pillar: body.content_pillar || null,
      caption: body.caption || null,
      estimated_engagement: body.estimated_engagement || null,
      post_url: body.post_url || null,
      image_url: body.image_url || null,
      posted_at: body.posted_at || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ post })
}
