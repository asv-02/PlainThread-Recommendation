import { NextRequest, NextResponse } from 'next/server'
import { getAuthClient } from '@/lib/db/route-client'
import { scrapeInstagramProfile, mapPostType } from '@/lib/apify/scraper'

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.APIFY_API_TOKEN) {
    return NextResponse.json({ error: 'Apify API token not configured' }, { status: 400 })
  }

  const { profile_url, max_posts } = await req.json()

  if (!profile_url) {
    return NextResponse.json({ error: 'profile_url required' }, { status: 400 })
  }

  const { data: brand } = await supabase
    .from('brands')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!brand) return NextResponse.json({ error: 'Set up brand first' }, { status: 400 })

  try {
    const posts = await scrapeInstagramProfile(profile_url, max_posts || 100)

    if (posts.length === 0) {
      return NextResponse.json({ error: 'No posts found' }, { status: 400 })
    }

    let imported = 0
    for (const post of posts) {
      // Insert post
      const { data: newPost, error } = await supabase
        .from('social_posts')
        .insert({
          brand_id: brand.id,
          platform: 'instagram',
          format: mapPostType(post.type),
          caption: post.caption?.slice(0, 2000) || null,
          permalink: post.url || null,
          published_at: post.timestamp || null,
        })
        .select()
        .single()

      if (error || !newPost) continue

      // Insert metrics
      await supabase.from('social_post_metrics').insert({
        post_id: newPost.id,
        likes: post.likesCount || null,
        comments: post.commentsCount || null,
        video_views: post.videoViewCount || null,
      })

      imported++
    }

    return NextResponse.json({
      imported,
      total: posts.length,
      profile: posts[0]?.ownerUsername || '',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Scraping failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
