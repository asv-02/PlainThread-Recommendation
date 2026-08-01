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
  if (!brand) return NextResponse.json({ posts: [] })

  const { data: posts } = await supabase
    .from('social_posts')
    .select('*')
    .eq('brand_id', brand.id)
    .order('published_at', { ascending: false })

  const postIds = posts?.map((p: Record<string, unknown>) => p.id as string) || []
  const { data: metrics } = postIds.length
    ? await supabase.from('social_post_metrics').select('*').in('post_id', postIds)
    : { data: [] }

  const postsWithMetrics = posts?.map((p: Record<string, unknown>) => ({
    ...p,
    metrics: metrics?.find((m: Record<string, unknown>) => m.post_id === p.id) || null,
  })) || []

  return NextResponse.json({ posts: postsWithMetrics })
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
  const { data: post, error } = await supabase
    .from('social_posts')
    .insert({
      brand_id: brand.id,
      platform: body.platform || 'instagram',
      format: body.format,
      caption: body.caption || null,
      media_url: body.media_url || null,
      permalink: body.permalink || null,
      published_at: body.published_at || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (body.metrics) {
    await supabase.from('social_post_metrics').insert({
      post_id: post.id,
      reach: body.metrics.reach || null,
      impressions: body.metrics.impressions || null,
      likes: body.metrics.likes || null,
      comments: body.metrics.comments || null,
      saves: body.metrics.saves || null,
      shares: body.metrics.shares || null,
      video_views: body.metrics.video_views || null,
    })
  }

  return NextResponse.json({ post })
}
