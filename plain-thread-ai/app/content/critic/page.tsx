'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/utils/api'

interface Critique {
  overall_score: number
  brand_fit: number
  novelty: number
  hook_strength: number
  shareability: number
  sales_potential: number
  risk_level: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  alternative_angle: string | null
}

export default function CriticPage() {
  const [loading, setLoading] = useState(false)
  const [idea, setIdea] = useState('')
  const [critique, setCritique] = useState<Critique | null>(null)

  async function handleCritique() {
    setLoading(true)
    try {
      const res = await apiFetch('/api/ai/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      })
      const data = await res.json()
      setCritique(data.critique)
    } catch {
      // handle error
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Idea Critic</h1>
      <p className="text-gray-500 text-sm mb-6">
        Describe your content idea and get an honest score and suggestions.
      </p>

      <textarea
        value={idea}
        onChange={e => setIdea(e.target.value)}
        placeholder="Describe your content idea... (e.g., A Reel comparing cheap vs expensive T-shirts)"
        rows={4}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 mb-4"
      />
      <button
        onClick={handleCritique}
        disabled={loading || !idea}
        className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50 transition"
      >
        {loading ? 'Analyzing...' : 'Critique This Idea'}
      </button>

      {critique && (
        <div className="mt-8 bg-white border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-brand-700">{critique.overall_score}/10</div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              critique.risk_level === 'low' ? 'bg-green-100 text-green-700' :
              critique.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {critique.risk_level} risk
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-sm">
            <Score label="Brand Fit" value={critique.brand_fit} />
            <Score label="Novelty" value={critique.novelty} />
            <Score label="Hook" value={critique.hook_strength} />
            <Score label="Shareability" value={critique.shareability} />
            <Score label="Sales" value={critique.sales_potential} />
          </div>

          <div>
            <h4 className="text-sm font-medium text-green-700 mb-1">Strengths</h4>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              {critique.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-red-700 mb-1">Weaknesses</h4>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              {critique.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-brand-700 mb-1">Suggestions</h4>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              {critique.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          {critique.alternative_angle && (
            <div>
              <h4 className="text-sm font-medium mb-1">Alternative Angle</h4>
              <p className="text-sm text-gray-600">{critique.alternative_angle}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value}/10</p>
    </div>
  )
}
