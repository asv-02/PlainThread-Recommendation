import type { Database } from './database'

export type Competitor = Database['public']['Tables']['competitors']['Row']
export type CompetitorPost = Database['public']['Tables']['competitor_posts']['Row']
