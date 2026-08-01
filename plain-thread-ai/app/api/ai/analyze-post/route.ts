import { NextRequest, NextResponse } from 'next/server'
import { getAI } from '@/lib/ai'
import { getAuthClient } from '@/lib/db/route-client'
import { fetchInstagramOEmbed, detectContentType, normalizeInstagramUrl } from '@/lib/instagram/oembed'
import { brandContext } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  const { supabase, user } = await getAuthClient(req)
  if (!supabase || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, caption, transcript, type, competitor_id } = await req.json()

  if (!url && !caption && !transcript) {
    return NextResponse.json({ error: 'Provide a URL, caption, or transcript' }, { status: 400 })
  }

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Try to fetch data from Instagram URL
  let postCaption = caption || ''
  let postType = type || 'unknown'
  let authorName = ''
  let fetchedFromUrl = false

  if (url) {
    const normalizedUrl = normalizeInstagramUrl(url)
    if (normalizedUrl) {
      postType = detectContentType(url)
      const oembed = await fetchInstagramOEmbed(url)
      if (oembed) {
        postCaption = oembed.title || postCaption
        authorName = oembed.author_name || ''
        fetchedFromUrl = true
      }
    }
  }

  // Build content for analysis
  const contentParts: string[] = []
  if (postCaption) contentParts.push(`Caption: ${postCaption}`)
  if (transcript) contentParts.push(`Transcript/Dialogue: ${transcript}`)
  if (postType !== 'unknown') contentParts.push(`Format: ${postType}`)
  if (authorName) contentParts.push(`Author: @${authorName}`)
  if (url) contentParts.push(`URL: ${url}`)

  if (contentParts.length === 0) {
    return NextResponse.json({ error: 'No content to analyze' }, { status: 400 })
  }

  const ai = getAI()
  const response = await ai.complete([
    {
      role: 'system',
      content: `You are an expert social media content analyst. Analyze this Instagram ${postType} and provide detailed insights.

${brandContext(brand)}

Return valid JSON:
{
  "analysis": {
    "format": "reel" | "carousel" | "single_post" | "story",
    "content_pillar": string,
    "topic": string,
    "hook": string (first line or opening),
    "hook_strength": number (1-10),
    "engagement_prediction": "low" | "medium" | "high" | "viral",
    "strengths": string[],
    "weaknesses": string[],
    "key_techniques": string[],
    "cta_used": string | null,
    "hashtag_strategy": string,
    "emotional_triggers": string[],
    "what_to_learn": string[],
    "how_to_adapt": string (how your brand could use this approach)
  }
}`
    },
    {
      role: 'user',
      content: `Analyze this Instagram content:\n\n${contentParts.join('\n')}`
    }
  ], { json: true })

  let analysis
  try {
    const parsed = JSON.parse(response)
    analysis = parsed.analysis || parsed
  } catch {
    return NextResponse.json({ error: 'Failed to parse analysis', raw: response }, { status: 500 })
  }

  // If competitor_id is provided, save as a competitor post
  if (competitor_id) {
    await supabase.from('competitor_posts').insert({
      competitor_id,
      format: analysis.format || postType,
      topic: analysis.topic || null,
      hook: analysis.hook || null,
      content_pillar: analysis.content_pillar || null,
      caption: postCaption?.slice(0, 500) || null,
      estimated_engagement: analysis.engagement_prediction || null,
      post_url: url || null,
      analysis: analysis,
    })
  }

  return NextResponse.json({
    analysis,
    fetched_from_url: fetchedFromUrl,
    caption: postCaption,
    author: authorName,
    format: postType,
  })
}
