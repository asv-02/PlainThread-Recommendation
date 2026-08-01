import { NextRequest, NextResponse } from 'next/server'
import { getAuthClient } from '@/lib/db/route-client'

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!brand) return NextResponse.json({ error: 'Set up brand first' }, { status: 400 })

  const { posts } = await req.json()

  if (!Array.isArray(posts) || posts.length === 0) {
    return NextResponse.json({ error: 'Provide an array of posts' }, { status: 400 })
  }

  let imported = 0
  const errors: string[] = []

  for (const post of posts) {
    if (!post.format) {
      errors.push('Skipped: missing format field')
      continue
    }

    const { data: newPost, error } = await supabase
      .from('social_posts')
      .insert({
        brand_id: brand.id,
        platform: post.platform || 'instagram',
        format: post.format,
        caption: post.caption || null,
        media_url: post.media_url || null,
        permalink: post.permalink || null,
        published_at: post.published_at || null,
      })
      .select()
      .single()

    if (error) {
      errors.push(`Failed: ${error.message}`)
      continue
    }

    if (post.metrics && newPost) {
      await supabase.from('social_post_metrics').insert({
        post_id: newPost.id,
        reach: post.metrics.reach || null,
        impressions: post.metrics.impressions || null,
        likes: post.metrics.likes || null,
        comments: post.metrics.comments || null,
        saves: post.metrics.saves || null,
        shares: post.metrics.shares || null,
        video_views: post.metrics.video_views || null,
      })
    }

    imported++
  }

  return NextResponse.json({ imported, errors, total: posts.length })
}
