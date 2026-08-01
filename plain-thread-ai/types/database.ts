export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          mission: string | null
          positioning: string | null
          target_audience: string | null
          tone_of_voice: string | null
          visual_style: string | null
          brand_values: string[] | null
          product_categories: string[] | null
          pricing_position: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          mission?: string | null
          positioning?: string | null
          target_audience?: string | null
          tone_of_voice?: string | null
          visual_style?: string | null
          brand_values?: string[] | null
          product_categories?: string[] | null
          pricing_position?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          name?: string
          description?: string | null
          mission?: string | null
          positioning?: string | null
          target_audience?: string | null
          tone_of_voice?: string | null
          visual_style?: string | null
          brand_values?: string[] | null
          product_categories?: string[] | null
          pricing_position?: string | null
        }
      }
      brand_documents: {
        Row: {
          id: string
          brand_id: string
          title: string
          category: string
          content: string
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          title: string
          category: string
          content: string
          file_url?: string | null
        }
        Update: {
          title?: string
          category?: string
          content?: string
          file_url?: string | null
        }
      }
      brand_memory: {
        Row: {
          id: string
          brand_id: string
          preference: string
          category: string
          confidence: number
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          preference: string
          category: string
          confidence?: number
          source?: string
        }
        Update: {
          preference?: string
          category?: string
          confidence?: number
          source?: string
        }
      }
      products: {
        Row: {
          id: string
          brand_id: string
          name: string
          description: string | null
          category: string | null
          features: string[] | null
          price: number | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          description?: string | null
          category?: string | null
          features?: string[] | null
          price?: number | null
          image_url?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          category?: string | null
          features?: string[] | null
          price?: number | null
          image_url?: string | null
        }
      }
      content_ideas: {
        Row: {
          id: string
          brand_id: string
          title: string
          format: string
          content_pillar: string | null
          hook: string | null
          concept: string | null
          script: string | null
          caption: string | null
          cta: string | null
          goal: string | null
          target_audience: string | null
          why_it_might_work: string | null
          evidence: string | null
          confidence_score: number | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          title: string
          format: string
          content_pillar?: string | null
          hook?: string | null
          concept?: string | null
          script?: string | null
          caption?: string | null
          cta?: string | null
          goal?: string | null
          target_audience?: string | null
          why_it_might_work?: string | null
          evidence?: string | null
          confidence_score?: number | null
          status?: string
        }
        Update: {
          title?: string
          format?: string
          content_pillar?: string | null
          hook?: string | null
          concept?: string | null
          script?: string | null
          caption?: string | null
          cta?: string | null
          goal?: string | null
          status?: string
          confidence_score?: number | null
        }
      }
      content_calendar: {
        Row: {
          id: string
          brand_id: string
          idea_id: string | null
          date: string
          platform: string
          content_type: string
          status: string
          caption: string | null
          script: string | null
          scheduled_time: string | null
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          idea_id?: string | null
          date: string
          platform?: string
          content_type: string
          status?: string
          caption?: string | null
          script?: string | null
          scheduled_time?: string | null
          published_at?: string | null
        }
        Update: {
          date?: string
          platform?: string
          content_type?: string
          status?: string
          caption?: string | null
          script?: string | null
          scheduled_time?: string | null
          published_at?: string | null
        }
      }
      competitors: {
        Row: {
          id: string
          brand_id: string
          name: string
          instagram_url: string | null
          website_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          instagram_url?: string | null
          website_url?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          instagram_url?: string | null
          website_url?: string | null
          notes?: string | null
        }
      }
      competitor_posts: {
        Row: {
          id: string
          competitor_id: string
          format: string
          topic: string | null
          hook: string | null
          content_pillar: string | null
          caption: string | null
          estimated_engagement: string | null
          post_url: string | null
          image_url: string | null
          analysis: Json | null
          posted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          competitor_id: string
          format: string
          topic?: string | null
          hook?: string | null
          content_pillar?: string | null
          caption?: string | null
          estimated_engagement?: string | null
          post_url?: string | null
          image_url?: string | null
          analysis?: Json | null
          posted_at?: string | null
        }
        Update: {
          format?: string
          topic?: string | null
          hook?: string | null
          content_pillar?: string | null
          caption?: string | null
          estimated_engagement?: string | null
          analysis?: Json | null
        }
      }
      social_posts: {
        Row: {
          id: string
          brand_id: string
          platform: string
          platform_post_id: string | null
          format: string
          caption: string | null
          media_url: string | null
          permalink: string | null
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          platform?: string
          platform_post_id?: string | null
          format: string
          caption?: string | null
          media_url?: string | null
          permalink?: string | null
          published_at?: string | null
        }
        Update: {
          platform?: string
          platform_post_id?: string | null
          format?: string
          caption?: string | null
          media_url?: string | null
          permalink?: string | null
          published_at?: string | null
        }
      }
      social_post_metrics: {
        Row: {
          id: string
          post_id: string
          reach: number | null
          impressions: number | null
          likes: number | null
          comments: number | null
          saves: number | null
          shares: number | null
          video_views: number | null
          collected_at: string
        }
        Insert: {
          id?: string
          post_id: string
          reach?: number | null
          impressions?: number | null
          likes?: number | null
          comments?: number | null
          saves?: number | null
          shares?: number | null
          video_views?: number | null
        }
        Update: {
          reach?: number | null
          impressions?: number | null
          likes?: number | null
          comments?: number | null
          saves?: number | null
          shares?: number | null
          video_views?: number | null
        }
      }
      ai_runs: {
        Row: {
          id: string
          brand_id: string
          type: string
          input: Json | null
          output: Json | null
          model: string
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          type: string
          input?: Json | null
          output?: Json | null
          model: string
          tokens_used?: number | null
        }
        Update: {
          type?: string
          input?: Json | null
          output?: Json | null
          model?: string
          tokens_used?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
