/**
 * Fetches Instagram post/reel metadata using the oEmbed API.
 * This is free and doesn't require authentication.
 * Returns: caption, author, thumbnail URL, type.
 */
export interface InstagramOEmbedData {
  title: string // caption
  author_name: string
  author_url: string
  thumbnail_url: string | null
  type: string // "rich"
  html: string // embed HTML
}

export async function fetchInstagramOEmbed(url: string): Promise<InstagramOEmbedData | null> {
  try {
    // Normalize URL
    const cleanUrl = normalizeInstagramUrl(url)
    if (!cleanUrl) return null

    const oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(cleanUrl)}&access_token=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}&omitscript=true`

    // Try Facebook's oEmbed endpoint first
    const fbRes = await fetch(oembedUrl, { next: { revalidate: 3600 } })
    if (fbRes.ok) {
      const data = await fbRes.json()
      return data
    }

    // Fallback: try the public oEmbed endpoint (may be rate-limited)
    const publicUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(cleanUrl)}&omitscript=true`
    const res = await fetch(publicUrl, { next: { revalidate: 3600 } })
    if (res.ok) {
      return await res.json()
    }

    return null
  } catch {
    return null
  }
}

/**
 * Extract caption from Instagram embed HTML (fallback method)
 */
export function extractCaptionFromEmbed(html: string): string {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/)
  return match?.[1]?.replace(/<[^>]+>/g, '').trim() || ''
}

/**
 * Normalize various Instagram URL formats
 */
export function normalizeInstagramUrl(url: string): string | null {
  const patterns = [
    /https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/,
    /https?:\/\/(www\.)?instagram\.com\/stories\/[^/]+\/(\d+)/,
  ]

  for (const pattern of patterns) {
    if (pattern.test(url)) {
      return url.split('?')[0] // Strip query params
    }
  }

  return null
}

/**
 * Detect content type from Instagram URL
 */
export function detectContentType(url: string): 'reel' | 'post' | 'carousel' | 'story' | 'unknown' {
  if (/\/(reel|reels)\//.test(url)) return 'reel'
  if (/\/stories\//.test(url)) return 'story'
  if (/\/(p|tv)\//.test(url)) return 'post' // Could be carousel too, determined by content
  return 'unknown'
}
