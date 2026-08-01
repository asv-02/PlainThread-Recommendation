-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Brands
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  mission TEXT,
  positioning TEXT,
  target_audience TEXT,
  tone_of_voice TEXT,
  visual_style TEXT,
  brand_values TEXT[],
  product_categories TEXT[],
  pricing_position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand Documents (Knowledge Base)
CREATE TABLE brand_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand Memory (Learning)
CREATE TABLE brand_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  preference TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence REAL DEFAULT 0.8,
  source TEXT NOT NULL DEFAULT 'user_feedback',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  features TEXT[],
  price NUMERIC,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Ideas
CREATE TABLE content_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  format TEXT NOT NULL,
  content_pillar TEXT,
  hook TEXT,
  concept TEXT,
  script TEXT,
  caption TEXT,
  cta TEXT,
  goal TEXT,
  target_audience TEXT,
  why_it_might_work TEXT,
  evidence TEXT,
  confidence_score REAL,
  status TEXT DEFAULT 'idea',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Calendar
CREATE TABLE content_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES content_ideas(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  platform TEXT DEFAULT 'instagram',
  content_type TEXT NOT NULL,
  status TEXT DEFAULT 'idea',
  caption TEXT,
  script TEXT,
  scheduled_time TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitors
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  instagram_url TEXT,
  website_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitor Posts
CREATE TABLE competitor_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  topic TEXT,
  hook TEXT,
  content_pillar TEXT,
  caption TEXT,
  estimated_engagement TEXT,
  post_url TEXT,
  image_url TEXT,
  analysis JSONB,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Posts (Your Instagram posts)
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  platform TEXT DEFAULT 'instagram',
  platform_post_id TEXT,
  format TEXT NOT NULL,
  caption TEXT,
  media_url TEXT,
  permalink TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Post Metrics
CREATE TABLE social_post_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  reach INTEGER,
  impressions INTEGER,
  likes INTEGER,
  comments INTEGER,
  saves INTEGER,
  shares INTEGER,
  video_views INTEGER,
  collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Runs (audit log)
CREATE TABLE ai_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  input JSONB,
  output JSONB,
  model TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_brands_user_id ON brands(user_id);
CREATE INDEX idx_content_ideas_brand_id ON content_ideas(brand_id);
CREATE INDEX idx_content_calendar_brand_id ON content_calendar(brand_id);
CREATE INDEX idx_content_calendar_date ON content_calendar(date);
CREATE INDEX idx_competitors_brand_id ON competitors(brand_id);
CREATE INDEX idx_social_posts_brand_id ON social_posts(brand_id);
CREATE INDEX idx_social_post_metrics_post_id ON social_post_metrics(post_id);

-- Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own brand data
CREATE POLICY "Users can manage their brands" ON brands
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Brand documents access" ON brand_documents
  FOR ALL USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Brand memory access" ON brand_memory
  FOR ALL USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Products access" ON products
  FOR ALL USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Content ideas access" ON content_ideas
  FOR ALL USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Content calendar access" ON content_calendar
  FOR ALL USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Competitors access" ON competitors
  FOR ALL USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Competitor posts access" ON competitor_posts
  FOR ALL USING (competitor_id IN (
    SELECT id FROM competitors WHERE brand_id IN (
      SELECT id FROM brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Social posts access" ON social_posts
  FOR ALL USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Social post metrics access" ON social_post_metrics
  FOR ALL USING (post_id IN (
    SELECT id FROM social_posts WHERE brand_id IN (
      SELECT id FROM brands WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "AI runs access" ON ai_runs
  FOR ALL USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));
