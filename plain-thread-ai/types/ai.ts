export interface DailyBrief {
  greeting: string
  performance_summary: string
  what_worked: string
  competitor_watch: string
  todays_opportunity: string
  scheduled_content: string
  recommendation: string
}

export interface ContentStrategy {
  current_goal: string
  content_mix: Record<string, number>
  weekly_plan: WeeklyPlanEntry[]
  recommendations: string[]
}

export interface WeeklyPlanEntry {
  day: string
  content_type: string
  content_pillar: string
  notes: string
}
