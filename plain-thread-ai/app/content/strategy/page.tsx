'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/utils/api'

interface StrategyPlan {
  strategy_summary: string
  weekly_plan: { day: string; format: string; content_pillar: string; topic: string; priority: string }[]
  key_insights: string[]
  growth_opportunities: string[]
}

export default function StrategyPage() {
  const [loading, setLoading] = useState(false)
  const [strategy, setStrategy] = useState<StrategyPlan | null>(null)

  async function generateStrategy() {
    setLoading(true)
    try {
      const res = await apiFetch('/api/ai/strategy', { method: 'POST' })
      const data = await res.json()
      if (!data.error) setStrategy(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Content Strategy</h1>
      <p className="text-gray-500 text-sm mb-6">
        AI-generated 7-day content plan based on your brand and performance data.
      </p>

      <button
        onClick={generateStrategy}
        disabled={loading}
        className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50 transition mb-6"
      >
        {loading ? 'Analyzing...' : strategy ? 'Regenerate Strategy' : 'Generate 7-Day Strategy'}
      </button>

      {strategy && (
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-2">Strategy Summary</h2>
            <p className="text-sm text-gray-700">{strategy.strategy_summary}</p>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-3">Weekly Plan</h2>
            <div className="space-y-2">
              {strategy.weekly_plan.map((day, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-500 w-16 shrink-0">{day.day}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    day.priority === 'high' ? 'bg-red-100 text-red-700' :
                    day.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{day.priority}</span>
                  <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded">{day.format}</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{day.content_pillar}</span>
                  <span className="text-sm flex-1">{day.topic}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-2">Key Insights</h3>
              <ul className="space-y-1">
                {strategy.key_insights.map((insight, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-brand-500 mt-0.5">•</span> {insight}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-2">Growth Opportunities</h3>
              <ul className="space-y-1">
                {strategy.growth_opportunities.map((opp, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span> {opp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
