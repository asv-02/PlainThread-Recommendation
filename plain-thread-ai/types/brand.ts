import type { Database } from './database'

export type Brand = Database['public']['Tables']['brands']['Row']
export type BrandInsert = Database['public']['Tables']['brands']['Insert']
export type BrandUpdate = Database['public']['Tables']['brands']['Update']

export type BrandDocument = Database['public']['Tables']['brand_documents']['Row']
export type BrandMemory = Database['public']['Tables']['brand_memory']['Row']
export type Product = Database['public']['Tables']['products']['Row']

export type BrandDocumentCategory =
  | 'brand_story'
  | 'product_info'
  | 'customer_persona'
  | 'brand_guidelines'
  | 'marketing_strategy'
  | 'competitor_notes'
  | 'other'
