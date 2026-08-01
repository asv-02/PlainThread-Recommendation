import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, AIMessage, AICompletionOptions } from './provider'

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  }

  private getModel(tier?: 'default' | 'cheap'): string {
    return tier === 'cheap'
      ? (process.env.AI_MODEL_CHEAP || 'gemini-2.0-flash-lite')
      : (process.env.AI_MODEL || 'gemini-2.0-flash')
  }

  async complete(messages: AIMessage[], options?: AICompletionOptions): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.getModel(options?.model),
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 4000,
        responseMimeType: options?.json ? 'application/json' : 'text/plain',
      },
    })

    // Combine system messages into the first user message instead of systemInstruction
    // This avoids the Gemini API format issues with systemInstruction
    const systemContent = messages
      .filter(m => m.role === 'system')
      .map(m => m.content)
      .join('\n')

    const conversationMessages = messages.filter(m => m.role !== 'system')

    // Prepend system content to the first user message
    const allMessages = conversationMessages.map((m, i) => {
      if (i === 0 && systemContent) {
        return { ...m, content: `${systemContent}\n\n---\n\n${m.content}` }
      }
      return m
    })

    // If no user messages, create one from system content
    if (allMessages.length === 0 && systemContent) {
      allMessages.push({ role: 'user', content: systemContent })
    }

    const history = allMessages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    }))

    const lastMessage = allMessages[allMessages.length - 1]

    const chat = model.startChat({ history })
    const result = await chat.sendMessage(lastMessage?.content || '')
    return result.response.text()
  }

  async *stream(messages: AIMessage[], options?: AICompletionOptions): AsyncIterable<string> {
    const model = this.client.getGenerativeModel({
      model: this.getModel(options?.model),
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 4000,
      },
    })

    const systemContent = messages
      .filter(m => m.role === 'system')
      .map(m => m.content)
      .join('\n')

    const conversationMessages = messages.filter(m => m.role !== 'system')

    const allMessages = conversationMessages.map((m, i) => {
      if (i === 0 && systemContent) {
        return { ...m, content: `${systemContent}\n\n---\n\n${m.content}` }
      }
      return m
    })

    if (allMessages.length === 0 && systemContent) {
      allMessages.push({ role: 'user', content: systemContent })
    }

    const history = allMessages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    }))

    const lastMessage = allMessages[allMessages.length - 1]

    const chat = model.startChat({ history })
    const result = await chat.sendMessageStream(lastMessage?.content || '')
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) yield text
    }
  }
}
