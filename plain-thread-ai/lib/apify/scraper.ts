import { ApifyClient } from 'apify-client'

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN || '' })

export interface ApifyInstagramPost {
  id: string
  type: string // 'Image' | 'Video' | 'Sidecar' (carousel)
  caption: string | null
  likesCount: number
  commentsCount: number
  timestamp: string
  url: string
  videoViewCount?: number
  hashtags?: string[]
  ownerUsername: string
}

/**
 * Scrape posts from an Instagram profile using Apify's Instagram Scraper.
 * Actor: apify/instagram-post-scraper or shu8hvrXbJbY3Eb9W (Instagram Scraper)
 */
export async function scrapeInstagramProfile(
  profileUrl: string,
  maxPosts: number = 50
): Promise<ApifyInstagramPost[]> {
  // Use the popular Instagram Scraper actor
  const run = await client.actor('shu8hvrXbJbY3Eb9W').call({
    directUrls: [profileUrl],
    resultsLimit: maxPosts,
    resultsType: 'posts',
    searchType: 'user',
  })

  // Fetch results from the dataset
  const { items } = await client.dataset(run.defaultDatasetId).listItems()

  return items.map((item: Record<string, unknown>) => ({
    id: (item.id as string) || '',
    type: (item.type as string) || 'Image',
    caption: (item.caption as string) || null,
    likesCount: (item.likesCount as number) || 0,
    commentsCount: (item.commentsCount as number) || 0,
    timestamp: (item.timestamp as string) || '',
    url: (item.url as string) || '',
    videoViewCount: (item.videoViewCount as number) || undefined,
    hashtags: (item.hashtags as string[]) || [],
    ownerUsername: (item.ownerUsername as string) || '',
  }))
}

/**
 * Map Apify post type to our format
 */
export function mapPostType(type: string): string {
  switch (type) {
    case 'Video': return 'reel'
    case 'Sidecar': return 'carousel'
    case 'Image': return 'single_post'
    default: return 'single_post'
  }
}
