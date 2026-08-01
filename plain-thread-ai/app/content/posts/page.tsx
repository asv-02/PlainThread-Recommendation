'use client'

import { useState, useEffect } from 'react'
import { Plus, Upload } from 'lucide-react'
import { apiFetch } from '@/lib/utils/api'

interface Post {
  id: string
  format: string
  caption: string | null
  published_at: string | null
  permalink: string | null
  metrics: { reach: number | null; likes: number | null; comments: number | null; saves: number | null } | null
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showScrape, setShowScrape] = useState(false)
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    format: 'reel', caption: '', published_at: '',
    reach: '', likes: '', comments: '', saves: '',
  })
  const [importJson, setImportJson] = useState('')
  const [importResult, setImportResult] = useState<string | null>(null)

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    try {
      const res = await apiFetch('/api/posts')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function scrapeMyProfile() {
    if (!scrapeUrl) return
    setScrapeLoading(true)
    setScrapeResult(null)
    try {
      const res = await apiFetch('/api/posts/scrape', {
        method: 'POST',
        body: JSON.stringify({ profile_url: scrapeUrl, max_posts: 100 }),
      })
      const data = await res.json()
      if (data.error) {
        setScrapeResult(`Error: ${data.error}`)
      } else {
        setScrapeResult(`Imported ${data.imported} posts from @${data.profile}`)
        setScrapeUrl('')
        setShowScrape(false)
        loadPosts()
      }
    } catch {
      setScrapeResult('Failed to scrape')
    }
    setScrapeLoading(false)
  }

  async function addPost(e: React.FormEvent) {
    e.preventDefault()
    await apiFetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: form.format,
        caption: form.caption || null,
        published_at: form.published_at || null,
        metrics: {
          reach: form.reach ? Number(form.reach) : null,
          likes: form.likes ? Number(form.likes) : null,
          comments: form.comments ? Number(form.comments) : null,
          saves: form.saves ? Number(form.saves) : null,
        },
      }),
    })
    setForm({ format: 'reel', caption: '', published_at: '', reach: '', likes: '', comments: '', saves: '' })
    setShowAdd(false)
    loadPosts()
  }

  async function handleImport() {
    try {
      const posts = JSON.parse(importJson)
      const res = await apiFetch('/api/posts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts: Array.isArray(posts) ? posts : [posts] }),
      })
      const data = await res.json()
      setImportResult(`Imported ${data.imported}/${data.total} posts.${data.errors?.length ? ` Errors: ${data.errors.join('; ')}` : ''}`)
      setImportJson('')
      loadPosts()
    } catch {
      setImportResult('Invalid JSON format.')
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-gray-500 text-sm">Track and import your published content.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowScrape(!showScrape)} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:border-green-300 text-green-600 transition">
            📥 Scrape Profile
          </button>
          <button onClick={() => setShowImport(!showImport)} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:border-brand-300 transition">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-3 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 transition">
            <Plus className="w-4 h-4" /> Add Post
          </button>
        </div>
      </div>

      {/* Scrape Section */}
      {showScrape && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-sm mb-2">Scrape Instagram Profile (via Apify)</h3>
          <p className="text-xs text-gray-500 mb-3">
            Paste your Instagram profile URL. This uses Apify to fetch all your posts with engagement metrics.
            Requires an Apify API token in settings.
          </p>
          <div className="flex gap-2">
            <input
              value={scrapeUrl}
              onChange={e => setScrapeUrl(e.target.value)}
              placeholder="https://www.instagram.com/yourprofile/"
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button
              onClick={scrapeMyProfile}
              disabled={scrapeLoading || !scrapeUrl}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {scrapeLoading ? 'Scraping...' : 'Scrape'}
            </button>
          </div>
          {scrapeResult && <p className="text-sm mt-2 text-gray-600">{scrapeResult}</p>}
        </div>
      )}

      {/* Import Section */}
      {showImport && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-sm mb-2">Bulk Import (JSON)</h3>
          <p className="text-xs text-gray-500 mb-3">
            Paste JSON array of posts. Each needs at minimum: format (reel/carousel/single_post/story).
            Optional: caption, published_at, metrics (reach, likes, comments, saves).
          </p>
          <textarea
            value={importJson}
            onChange={e => setImportJson(e.target.value)}
            placeholder='[{"format":"reel","caption":"My post","published_at":"2024-01-15","metrics":{"likes":150,"reach":2000}}]'
            rows={4}
            className="w-full px-3 py-2 border rounded-lg text-xs font-mono mb-2"
          />
          <button onClick={handleImport} disabled={!importJson} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm disabled:opacity-50">
            Import Posts
          </button>
          {importResult && <p className="text-sm text-gray-600 mt-2">{importResult}</p>}
        </div>
      )}

      {/* Add Post Form */}
      {showAdd && (
        <form onSubmit={addPost} className="bg-white border rounded-xl p-5 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select value={form.format} onChange={e => setForm(p => ({ ...p, format: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm">
              <option value="reel">Reel</option>
              <option value="carousel">Carousel</option>
              <option value="single_post">Single Post</option>
              <option value="story">Story</option>
            </select>
            <input type="date" value={form.published_at} onChange={e => setForm(p => ({ ...p, published_at: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <textarea value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))} placeholder="Caption" className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
          <div className="grid grid-cols-4 gap-2">
            <input value={form.reach} onChange={e => setForm(p => ({ ...p, reach: e.target.value }))} placeholder="Reach" type="number" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.likes} onChange={e => setForm(p => ({ ...p, likes: e.target.value }))} placeholder="Likes" type="number" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.comments} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))} placeholder="Comments" type="number" className="px-3 py-2 border rounded-lg text-sm" />
            <input value={form.saves} onChange={e => setForm(p => ({ ...p, saves: e.target.value }))} placeholder="Saves" type="number" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm">Save Post</button>
        </form>
      )}

      {/* Posts List */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : posts.length === 0 ? (
        <div className="bg-gray-50 border border-dashed rounded-xl p-8 text-center text-gray-400 text-sm">
          No posts yet. Add manually or import your data.
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map(post => (
            <div key={post.id} className="bg-white border rounded-lg p-4 flex items-center gap-4">
              <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded">{post.format}</span>
              <span className="flex-1 text-sm text-gray-700 truncate">{post.caption || 'No caption'}</span>
              {post.published_at && <span className="text-xs text-gray-400">{new Date(post.published_at).toLocaleDateString()}</span>}
              {post.metrics && (
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>❤️ {post.metrics.likes || 0}</span>
                  <span>💬 {post.metrics.comments || 0}</span>
                  <span>🔖 {post.metrics.saves || 0}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
