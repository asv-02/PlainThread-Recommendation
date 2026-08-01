import { OpenAIProvider } from './openai'
import type { AIProvider } from './provider'

let aiInstance: AIProvider | null = null

export function getAI(): AIProvider {
  if (!aiInstance) {
    aiInstance = new OpenAIProvider()
  }
  return aiInstance
}

export type { AIProvider, AIMessage, AICompletionOptions } from './provider'
