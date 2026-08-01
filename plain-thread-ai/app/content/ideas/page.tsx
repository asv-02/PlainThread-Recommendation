'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/utils/api'

interface Idea {
  title: string
  format: string
  content_pillar: string
  hook: string
  concept: string
  why_it_might_work: string
  confidence_score: number
}

export default function IdeasPage() {
  const [loading, setLoading] = useState(false)
  const [goal, setGoal] = useState('')
  const [ideas, setIdeas] = useState<Idea[]>([])

  async function generateIdeas() {
    setLoading(true)
    try {
      const res = await apiFetch('/api/ai/generate-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      })
      const data = await res.json()
      setIdeas(data.ideas || [])
    } catch {
      // handle error
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Idea Generator</h1>
      <p className="text-gray-500 text-sm mb-6">
        AI generates content ideas based on your brand, audience, and performance data.
      </p>

      <div className="flex gap-2 mb-8">
        <input
          value={goal}
          onChange={e => setGoal(e.target.value)}
          placeholder="What's your goal? (e.g., increase reach, promote new product)"
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={generateIdeas}
          disabled={loading}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50 transition"
        >
          {loading ? 'Generating...' : 'Generate Ideas'}
        </button>
      </div>

      {ideas.length > 0 && (
        <div className="space-y-4">
          {ideas.map((idea, i) => (
            <div key={i} className="bg-white border rounded-xl p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{idea.title}</h3>
                <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full">
                  {idea.confidence_score}% confidence
                </span>
              </div>
              <div className="flex gap-2 mb-3">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{idea.format}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{idea.content_pillar}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2"><strong>Hook:</strong> {idea.hook}</p>
              <p className="text-sm text-gray-600 mb-2"><strong>Concept:</strong> {idea.concept}</p>
              <p className="text-sm text-gray-500 italic">{idea.why_it_might_work}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
