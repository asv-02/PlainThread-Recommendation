import { NextRequest, NextResponse } from 'next/server'
import { getAuthClient } from '@/lib/db/route-client'
import { scrapeInstagramProfile, mapPostType } from '@/lib/apify/scraper'

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.APIFY_API_TOKEN) {
    return NextResponse.json({ error: 'Apify API token not configured. Add APIFY_API_TOKEN to .env.local' }, { status: 400 })
  }

  const { profile_url, competitor_id, max_posts } = await req.json()

  if (!profile_url || !competitor_id) {
    return NextResponse.json({ error: 'profile_url and competitor_id required' }, { status: 400 })
  }

  try {
    const posts = await scrapeInstagramProfile(profile_url, max_posts || 50)

    if (posts.length === 0) {
      return NextResponse.json({ error: 'No posts found. Check the profile URL and try again.' }, { status: 400 })
    }

    // Save posts to competitor_posts table
    let imported = 0
    for (const post of posts) {
      const { error } = await supabase.from('competitor_posts').insert({
        competitor_id,
        format: mapPostType(post.type),
        topic: null,
        hook: post.caption?.split('\n')[0]?.slice(0, 200) || null,
        content_pillar: null,
        caption: post.caption?.slice(0, 1000) || null,
        estimated_engagement: `${post.likesCount} likes, ${post.commentsCount} comments${post.videoViewCount ? `, ${post.videoViewCount} views` : ''}`,
        post_url: post.url || null,
        posted_at: post.timestamp || null,
      })
      if (!error) imported++
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
