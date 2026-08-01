'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/db/client'
import { Plus, Brain, ChevronDown, ChevronUp } from 'lucide-react'
import { apiFetch } from '@/lib/utils/api'

interface Competitor {
  id: string
  name: string
  instagram_url: string | null
  website_url: string | null
  notes: string | null
}

interface CompetitorPost {
  id: string
  competitor_id: string
  format: string
  topic: string | null
  hook: string | null
  content_pillar: string | null
  estimated_engagement: string | null
}

interface Analysis {
  patterns: { pattern: string; frequency: string; effectiveness: string }[]
  opportunities: { gap: string; suggestion: string; priority: string }[]
  content_themes: string[]
  what_to_avoid: string[]
  tactical_recommendations: string[]
}

export default function CompetitorsPage() {
  const supabase = createClient()
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [posts, setPosts] = useState<CompetitorPost[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showPostForm, setShowPostForm] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [form, setForm] = useState({ name: '', instagram_url: '', website_url: '', notes: '' })
  const [postForm, setPostForm] = useState({ format: 'reel', topic: '', hook: '', content_pillar: '', estimated_engagement: '' })

  useEffect(() => {
    loadCompetitors()
    loadPosts()
  }, [])

  async function loadCompetitors() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: brand } = await supabase.from('brands').select('id').eq('user_id', user.id).single()
    if (!brand) return
    const { data } = await supabase.from('competitors').select('*').eq('brand_id', brand.id)
    setCompetitors(data || [])
  }

  async function loadPosts() {
    try {
      const res = await apiFetch('/api/competitors/posts')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch { /* ignore */ }
  }

  async function addCompetitor(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: brand } = await supabase.from('brands').select('id').eq('user_id', user.id).single()
    if (!brand) return

    await supabase.from('competitors').insert({
      brand_id: brand.id,
      name: form.name,
      instagram_url: form.instagram_url || null,
      website_url: form.website_url || null,
      notes: form.notes || null,
    })
    setForm({ name: '', instagram_url: '', website_url: '', notes: '' })
    setShowForm(false)
    loadCompetitors()
  }

  async function addPost(e: React.FormEvent) {
    e.preventDefault()
    if (!showPostForm) return

    await apiFetch('/api/competitors/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        competitor_id: showPostForm,
        ...postForm,
      }),
    })
    setPostForm({ format: 'reel', topic: '', hook: '', content_pillar: '', estimated_engagement: '' })
    setShowPostForm(null)
    loadPosts()
  }

  async function runAnalysis(competitorId?: string) {
    setAnalyzing(true)
    try {
      const res = await apiFetch('/api/ai/competitor-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitor_id: competitorId || null }),
      })
      const data = await res.json()
      if (!data.error) setAnalysis(data)
    } catch { /* ignore */ }
    setAnalyzing(false)
  }

  function getPostsForCompetitor(id: string) {
    return posts.filter(p => p.competitor_id === id)
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Competitors</h1>
          <p className="text-gray-500 text-sm">Track, analyze, and find opportunities.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => runAnalysis()}
            disabled={analyzing || posts.length === 0}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:border-brand-300 disabled:opacity-50 transition"
          >
            <Brain className="w-4 h-4" /> {analyzing ? 'Analyzing...' : 'Analyze All'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 transition"
          >
            <Plus className="w-4 h-4" /> Add Competitor
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={addCompetitor} className="bg-white border rounded-xl p-5 mb-6 space-y-3">
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Competitor name" required className="w-full px-3 py-2 border rounded-lg text-sm" />
          <input value={form.instagram_url} onChange={e => setForm(p => ({ ...p, instagram_url: e.target.value }))} placeholder="Instagram URL" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <input value={form.website_url} onChange={e => setForm(p => ({ ...p, website_url: e.target.value }))} placeholder="Website URL" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm">Save</button>
        </form>
      )}

      {/* AI Analysis Results */}
      {analysis && (
        <div className="bg-white border rounded-xl p-5 mb-6 space-y-4">
          <h2 className="font-semibold">AI Analysis</h2>
          
          {analysis.patterns.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Patterns Detected</h3>
              {analysis.patterns.map((p, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 mb-2">
                  <p className="text-sm font-medium">{p.pattern}</p>
                  <p className="text-xs text-gray-500">Frequency: {p.frequency} · Effectiveness: {p.effectiveness}</p>
                </div>
              ))}
            </div>
          )}

          {analysis.opportunities.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-green-700 mb-2">Opportunities</h3>
              {analysis.opportunities.map((o, i) => (
                <div key={i} className="bg-green-50 rounded-lg p-3 mb-2">
                  <p className="text-sm font-medium">{o.gap}</p>
                  <p className="text-sm text-gray-600">{o.suggestion}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${o.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {o.priority} priority
                  </span>
                </div>
              ))}
            </div>
          )}

          {analysis.tactical_recommendations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-brand-700 mb-2">Recommendations</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {analysis.tactical_recommendations.map((r, i) => <li key={i}>• {r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Competitors List */}
      {competitors.length === 0 ? (
        <p className="text-gray-400 text-sm">No competitors added yet.</p>
      ) : (
        <div className="space-y-3">
          {competitors.map(c => {
            const competitorPosts = getPostsForCompetitor(c.id)
            const isExpanded = expanded === c.id
            return (
              <div key={c.id} className="bg-white border rounded-xl overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    {c.instagram_url && <p className="text-xs text-gray-500">{c.instagram_url}</p>}
                    <span className="text-xs text-gray-400">{competitorPosts.length} posts tracked</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPostForm(showPostForm === c.id ? null : c.id)}
                      className="text-xs px-2 py-1 border rounded hover:border-brand-300"
                    >
                      + Post
                    </button>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : c.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {showPostForm === c.id && (
                  <form onSubmit={addPost} className="px-4 pb-4 space-y-2 border-t pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <select value={postForm.format} onChange={e => setPostForm(p => ({ ...p, format: e.target.value }))} className="px-2 py-1.5 border rounded text-xs">
                        <option value="reel">Reel</option>
                        <option value="carousel">Carousel</option>
                        <option value="single_post">Single Post</option>
                        <option value="story">Story</option>
                      </select>
                      <input value={postForm.content_pillar} onChange={e => setPostForm(p => ({ ...p, content_pillar: e.target.value }))} placeholder="Content pillar" className="px-2 py-1.5 border rounded text-xs" />
                    </div>
                    <input value={postForm.topic} onChange={e => setPostForm(p => ({ ...p, topic: e.target.value }))} placeholder="Topic" className="w-full px-2 py-1.5 border rounded text-xs" />
                    <input value={postForm.hook} onChange={e => setPostForm(p => ({ ...p, hook: e.target.value }))} placeholder="Hook (first line)" className="w-full px-2 py-1.5 border rounded text-xs" />
                    <input value={postForm.estimated_engagement} onChange={e => setPostForm(p => ({ ...p, estimated_engagement: e.target.value }))} placeholder="Engagement (e.g., high, 5k likes)" className="w-full px-2 py-1.5 border rounded text-xs" />
                    <button type="submit" className="px-3 py-1.5 bg-brand-600 text-white rounded text-xs">Add Post</button>
                  </form>
                )}

                {isExpanded && competitorPosts.length > 0 && (
                  <div className="px-4 pb-4 space-y-1 border-t pt-3">
                    {competitorPosts.map(p => (
                      <div key={p.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded p-2">
                        <span className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded">{p.format}</span>
                        <span className="text-gray-600 flex-1">{p.topic || p.hook || 'No topic'}</span>
                        {p.estimated_engagement && <span className="text-gray-400">{p.estimated_engagement}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
