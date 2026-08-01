export const APP_CONFIG = {
  name: 'Plain Thread AI',
  description: 'AI Social Media Manager',
  version: '0.1.0',
  brand: {
    maxDocuments: 50,
    maxProductsPerBrand: 100,
  },
  content: {
    maxIdeasPerDay: 20,
    maxCalendarDays: 90,
  },
  competitors: {
    maxCompetitors: 20,
    maxPostsPerCompetitor: 500,
  },
  ai: {
    maxTokensPerRequest: 4000,
    maxContextTokens: 8000,
  },
} as const
