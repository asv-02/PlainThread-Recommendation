# Plain Thread AI — Social Media Manager

AI-powered social media manager for fashion brands. Strategy, content creation, competitor intelligence, and performance analytics — all in one place.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in your Supabase and OpenAI credentials

# Run the database migration in Supabase SQL Editor
# (paste contents of supabase/migrations/001_initial_schema.sql)

npm run dev
```

## Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, RLS)
- OpenAI API (provider-abstracted)

## Features

### Brand Brain
- Brand profile (name, mission, audience, tone, values)
- Brand Memory — AI learns your preferences over time
- Knowledge base and documents

### Content Creation (Phase 5)
- Reel script generator (hook, body, CTA, production notes)
- Carousel post designer (multi-slide with visual direction)
- Shot list / production planner
- AI Idea Generator with confidence scoring
- Idea Critic (scores, strengths, weaknesses, suggestions)

### Strategy (Phase 4)
- Daily AI Brief (today's recommendation, best time, quick win, insight)
- 7-day strategy planner based on performance data
- Learning loop — AI extracts preferences from conversations

### Content Management (Phase 2)
- Post tracker with metrics (reach, likes, comments, saves)
- Bulk import (JSON)
- Content calendar (weekly view with status tracking)
- Manual post entry with engagement data

### Competitor Intelligence (Phase 3)
- Competitor profiles
- Manual post tracking (format, topic, hook, engagement)
- AI-powered pattern detection
- Opportunity identification
- Tactical recommendations

### Analytics
- Performance overview (reach, likes, comments, saves)
- Per-post metrics
- Engagement tracking

## Environment Variables

See `.env.example` for all required variables.

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/ai/chat` | POST | AI chat with brand context |
| `/api/ai/generate-idea` | POST | Generate content ideas |
| `/api/ai/critique` | POST | Critique a content idea |
| `/api/ai/daily-brief` | GET | Daily content brief |
| `/api/ai/strategy` | POST | 7-day strategy plan |
| `/api/ai/competitor-analysis` | POST | Analyze competitor posts |
| `/api/ai/reel-script` | POST | Generate reel script |
| `/api/ai/carousel` | POST | Generate carousel post |
| `/api/ai/shot-list` | POST | Generate shot list |
| `/api/ai/learn` | POST | Extract learnings from interaction |
| `/api/posts` | GET/POST | List/add posts |
| `/api/posts/import` | POST | Bulk import posts |
| `/api/competitors/posts` | GET/POST | Competitor posts |
| `/api/calendar` | GET/POST/PATCH | Content calendar |
| `/api/memory` | GET/POST/DELETE | Brand memory |
