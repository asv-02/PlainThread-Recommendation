'use client'

import { useState } from 'react'
import { Link2, FileText, Mic } from 'lucide-react'
import { apiFetch } from '@/lib/utils/api'

interface PostAnalysis {
  format: string
  content_pillar: string
  topic: string
  hook: string
  hook_strength: number
  engagement_prediction: string
  strengths: string[]
  weaknesses: string[]
  key_techniques: string[]
  cta_used: string | null
  hashtag_strategy: string
  emotional_triggers: string[]
  what_to_learn: string[]
  how_to_adapt: string
}

export default function AnalyzePostPage() {
  const [url, setUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<PostAnalysis | null>(null)
  const [meta, setMeta] = useState<{ author: string; format: string; fetched_from_url: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function analyze() {
    if (!url && !caption && !transcript) return
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const res = await apiFetch('/api/ai/analyze-post', {
        method: 'POST',
        body: JSON.stringify({ url: url || undefined, caption: caption || undefined, transcript: transcript || undefined }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setAnalysis(data.analysis)
        setMeta({ author: data.author, format: data.format, fetched_from_url: data.fetched_from_url })
      }
    } catch {
      setError('Failed to analyze. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Analyze Post</h1>
      <p className="text-gray-500 text-sm mb-6">
        Paste an Instagram link, caption, or reel transcript to get AI analysis.
      </p>

      <div className="bg-white border rounded-xl p-5 space-y-4 mb-6">
        {/* URL Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Link2 className="w-4 h-4" /> Instagram URL
          </label>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/... or /p/..."
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-xs text-gray-400 mt-1">We&apos;ll try to fetch the caption automatically</p>
        </div>

        {/* Caption Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <FileText className="w-4 h-4" /> Caption (optional if URL works)
          </label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Paste the post caption here..."
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Transcript Input (for Reels) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Mic className="w-4 h-4" /> Reel Transcript / Dialogue (for video content)
          </label>
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Paste what's said in the reel... (from auto-captions or manual transcription)"
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <button
          onClick={analyze}
          disabled={loading || (!url && !caption && !transcript)}
          className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50 transition"
        >
          {loading ? 'Analyzing...' : 'Analyze Content'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="bg-white border rounded-xl p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg">{analysis.topic}</h2>
              {meta?.author && <p className="text-sm text-gray-500">@{meta.author}</p>}
            </div>
            <div className="flex gap-2">
              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded">{analysis.format}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{analysis.content_pillar}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                analysis.engagement_prediction === 'viral' ? 'bg-purple-100 text-purple-700' :
                analysis.engagement_prediction === 'high' ? 'bg-green-100 text-green-700' :
                analysis.engagement_prediction === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {analysis.engagement_prediction} engagement
              </span>
            </div>
          </div>

          {/* Hook */}
          <div className="bg-brand-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-brand-600 font-medium">HOOK</p>
              <span className="text-xs text-brand-600">{analysis.hook_strength}/10</span>
            </div>
            <p className="text-sm">{analysis.hook}</p>
          </div>

          {/* Techniques */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Key Techniques</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.key_techniques.map((t, i) => (
                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{t}</span>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-green-700 mb-2">Strengths</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {analysis.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-green-500">✓</span> {s}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-700 mb-2">Weaknesses</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {analysis.weaknesses.map((w, i) => <li key={i} className="flex gap-2"><span className="text-red-500">✗</span> {w}</li>)}
              </ul>
            </div>
          </div>

          {/* Emotional Triggers */}
          {analysis.emotional_triggers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Emotional Triggers</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.emotional_triggers.map((t, i) => (
                  <span key={i} className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* What to Learn */}
          <div>
            <h3 className="text-sm font-medium text-brand-700 mb-2">What to Learn From This</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {analysis.what_to_learn.map((l, i) => <li key={i}>• {l}</li>)}
            </ul>
          </div>

          {/* How to Adapt */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">How Your Brand Can Adapt This</h3>
            <p className="text-sm text-gray-600">{analysis.how_to_adapt}</p>
          </div>

          {/* CTA & Hashtags */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {analysis.cta_used && (
              <div>
                <p className="text-xs text-gray-500 font-medium">CTA USED</p>
                <p>{analysis.cta_used}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 font-medium">HASHTAG STRATEGY</p>
              <p>{analysis.hashtag_strategy}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
