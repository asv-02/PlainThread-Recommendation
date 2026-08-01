import type { Database } from './database'

export type SocialPost = Database['public']['Tables']['social_posts']['Row']
export type SocialPostMetrics = Database['public']['Tables']['social_post_metrics']['Row']

export interface PerformanceSummary {
  total_posts: number
  avg_reach: number
  avg_engagement: number
  top_format: string
  top_content_pillar: string
  trend: 'up' | 'down' | 'stable'
  period: '7d' | '30d' | '90d'
}
