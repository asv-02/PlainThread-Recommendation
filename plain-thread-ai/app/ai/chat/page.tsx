'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Brain } from 'lucide-react'
import { apiFetch } from '@/lib/utils/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [learned, setLearned] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await apiFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      const assistantMsg: Message = { role: 'assistant', content: data.message }
      setMessages(prev => [...prev, assistantMsg])

      // Learning loop: extract preferences from conversation
      if (newMessages.length >= 4) {
        const lastExchange = `User: ${userMsg.content}\nAssistant: ${data.message}`
        apiFetch('/api/ai/learn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interaction: lastExchange }),
        }).then(res => res.json()).then(data => {
          if (data.learned > 0) setLearned(prev => prev + data.learned)
        }).catch(() => {})
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Chat</h1>
          <p className="text-gray-500 text-sm">Your AI social media strategist.</p>
        </div>
        {learned > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full">
            <Brain className="w-3 h-3" />
            {learned} new preference{learned > 1 ? 's' : ''} learned
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20 space-y-3">
            <p className="text-lg">Ask me anything about content, strategy, or your brand.</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              {[
                'What should I post today?',
                'Critique my latest reel idea',
                'Help me write a caption',
                'Suggest content for this week',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-xs bg-white border px-3 py-1.5 rounded-full hover:border-brand-300 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-brand-600 text-white'
                : 'bg-white border text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border px-4 py-3 rounded-xl text-sm text-gray-400">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask your AI social media manager..."
          className="flex-1 px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
