import { GeminiProvider } from './gemini'
import { OpenAIProvider } from './openai'
import type { AIProvider } from './provider'

let aiInstance: AIProvider | null = null

export function getAI(): AIProvider {
  if (!aiInstance) {
    const provider = process.env.AI_PROVIDER || 'gemini'

    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      aiInstance = new OpenAIProvider()
    } else {
      // Default to Gemini (free tier available)
      aiInstance = new GeminiProvider()
    }
  }
  return aiInstance
}

export type { AIProvider, AIMessage, AICompletionOptions } from './provider'
