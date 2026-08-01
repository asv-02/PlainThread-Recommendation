import type { Database } from './database'

export type ContentIdea = Database['public']['Tables']['content_ideas']['Row']
export type ContentCalendarEntry = Database['public']['Tables']['content_calendar']['Row']

export type ContentFormat = 'reel' | 'carousel' | 'single_post' | 'story'
export type ContentStatus = 'idea' | 'draft' | 'approved' | 'ready' | 'scheduled' | 'published' | 'analyzed'
export type ContentPillar = 'lifestyle' | 'educational' | 'brand_story' | 'product' | 'community' | 'behind_the_scenes'

export interface IdeaCritique {
  overall_score: number
  brand_fit: number
  novelty: number
  hook_strength: number
  shareability: number
  sales_potential: number
  risk_level: 'low' | 'medium' | 'high'
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  alternative_angle: string | null
}
