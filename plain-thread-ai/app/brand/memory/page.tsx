'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { apiFetch } from '@/lib/utils/api'

interface Memory {
  id: string
  preference: string
  category: string
  confidence: number
  source: string
  created_at: string
}

const CATEGORIES = ['tone', 'content', 'visual', 'audience', 'timing', 'format', 'topic']

export default function BrandMemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ preference: '', category: 'content' })

  useEffect(() => { loadMemories() }, [])

  async function loadMemories() {
    try {
      const res = await apiFetch('/api/memory')
      const data = await res.json()
      setMemories(data.memories || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function addMemory(e: React.FormEvent) {
    e.preventDefault()
    await apiFetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ preference: '', category: 'content' })
    setShowAdd(false)
    loadMemories()
  }

  async function deleteMemory(id: string) {
    await apiFetch('/api/memory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadMemories()
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catMemories = memories.filter(m => m.category === cat)
    if (catMemories.length > 0) acc[cat] = catMemories
    return acc
  }, {} as Record<string, Memory[]>)

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Brand Memory</h1>
          <p className="text-gray-500 text-sm">What the AI has learned about your brand preferences.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 transition"
        >
          <Plus className="w-4 h-4" /> Add Memory
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addMemory} className="bg-white border rounded-xl p-5 mb-6 space-y-3">
          <input
            value={form.preference}
            onChange={e => setForm(p => ({ ...p, preference: e.target.value }))}
            placeholder="e.g., We never use exclamation marks in captions"
            required
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <select
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm">Save</button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : memories.length === 0 ? (
        <div className="bg-gray-50 border border-dashed rounded-xl p-8 text-center text-gray-400 text-sm">
          <p>No memories yet.</p>
          <p className="mt-1">The AI learns your preferences as you use the chat and critic features. You can also add them manually.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catMemories]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">{category}</h2>
              <div className="space-y-2">
                {catMemories.map(m => (
                  <div key={m.id} className="bg-white border rounded-lg p-3 flex items-center justify-between group">
                    <div>
                      <p className="text-sm">{m.preference}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Source: {m.source} · Confidence: {Math.round(m.confidence * 100)}%
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMemory(m.id)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
