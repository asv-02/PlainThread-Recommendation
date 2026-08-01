import OpenAI from 'openai'
import type { AIProvider, AIMessage, AICompletionOptions } from './provider'

export class OpenAIProvider implements AIProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  private getModel(tier?: 'default' | 'cheap'): string {
    return tier === 'cheap'
      ? (process.env.AI_MODEL_CHEAP || 'gpt-4o-mini')
      : (process.env.AI_MODEL || 'gpt-4o')
  }

  async complete(messages: AIMessage[], options?: AICompletionOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.getModel(options?.model),
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      response_format: options?.json ? { type: 'json_object' } : undefined,
    })

    return response.choices[0]?.message?.content || ''
  }

  async *stream(messages: AIMessage[], options?: AICompletionOptions): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: this.getModel(options?.model),
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) yield content
    }
  }
}
