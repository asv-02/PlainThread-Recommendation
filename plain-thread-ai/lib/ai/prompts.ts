// Centralized AI prompts for all features

export function brandContext(brand: Record<string, unknown> | null): string {
  if (!brand) return 'No brand profile set up yet.'
  return `Brand: ${brand.name || 'Unknown'}
Description: ${brand.description || 'N/A'}
Mission: ${brand.mission || 'N/A'}
Positioning: ${brand.positioning || 'N/A'}
Target Audience: ${brand.target_audience || 'N/A'}
Tone of Voice: ${brand.tone_of_voice || 'N/A'}
Visual Style: ${brand.visual_style || 'N/A'}
Values: ${(brand.brand_values as string[])?.join(', ') || 'N/A'}
Product Categories: ${(brand.product_categories as string[])?.join(', ') || 'N/A'}
Pricing: ${brand.pricing_position || 'N/A'}`
}

export const DAILY_BRIEF_PROMPT = `You are the AI social media strategist for this brand. Generate a daily brief that includes:
1. Content recommendation for today (format, topic, hook)
2. Best posting time suggestion
3. One quick win (something easy to post today)
4. One strategic insight based on recent trends

Return valid JSON:
{
  "recommendation": { "format": string, "topic": string, "hook": string, "why": string },
  "best_time": string,
  "quick_win": { "idea": string, "effort": "low"|"medium" },
  "insight": string,
  "motivation": string
}`

export const STRATEGY_PROMPT = `Analyze the brand's content performance and provide a strategic content plan for the next 7 days.
Consider: what formats work best, which content pillars drive engagement, optimal posting frequency.

Return valid JSON:
{
  "strategy_summary": string,
  "weekly_plan": [{ "day": string, "format": string, "content_pillar": string, "topic": string, "priority": "high"|"medium"|"low" }],
  "key_insights": string[],
  "growth_opportunities": string[]
}`

export const COMPETITOR_ANALYSIS_PROMPT = `Analyze these competitor posts and identify patterns, opportunities, and gaps.

Return valid JSON:
{
  "patterns": [{ "pattern": string, "frequency": string, "effectiveness": string }],
  "opportunities": [{ "gap": string, "suggestion": string, "priority": "high"|"medium"|"low" }],
  "content_themes": string[],
  "what_to_avoid": string[],
  "tactical_recommendations": string[]
}`

export const REEL_SCRIPT_PROMPT = `Write a complete Instagram Reel script for this concept. Include hook (first 3 seconds), body, CTA, and production notes.

Return valid JSON:
{
  "title": string,
  "duration_seconds": number,
  "hook": { "text": string, "visual": string, "duration": "0-3s" },
  "body": [{ "timestamp": string, "narration": string, "visual": string, "text_overlay": string | null }],
  "cta": { "text": string, "visual": string },
  "music_suggestion": string,
  "hashtags": string[],
  "caption": string,
  "production_notes": string[]
}`

export const CAROUSEL_PROMPT = `Design an Instagram carousel post for this concept. Include all slides with text and visual direction.

Return valid JSON:
{
  "title": string,
  "slides": [{ "slide_number": number, "headline": string, "body_text": string, "visual_direction": string, "design_notes": string | null }],
  "caption": string,
  "hashtags": string[],
  "cta": string
}`

export const SHOT_LIST_PROMPT = `Create a detailed shot list/production plan for this content piece.

Return valid JSON:
{
  "title": string,
  "total_shots": number,
  "estimated_time": string,
  "equipment_needed": string[],
  "shots": [{ "shot_number": number, "description": string, "angle": string, "lighting": string, "props": string[], "notes": string | null }],
  "styling_notes": string,
  "location_suggestions": string[]
}`

export const LEARN_MEMORY_PROMPT = `Based on this interaction, extract any brand preferences or learnings that should be remembered for future content.
Only extract clear, actionable preferences. If nothing notable, return empty array.

Return valid JSON:
{
  "memories": [{ "preference": string, "category": "tone"|"content"|"visual"|"audience"|"timing"|"format"|"topic" }]
}`
