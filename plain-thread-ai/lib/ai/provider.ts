export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AICompletionOptions {
  model?: 'default' | 'cheap'
  temperature?: number
  maxTokens?: number
  json?: boolean
}

export interface AIProvider {
  complete(messages: AIMessage[], options?: AICompletionOptions): Promise<string>
  stream(messages: AIMessage[], options?: AICompletionOptions): AsyncIterable<string>
}
