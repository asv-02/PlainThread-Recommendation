'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/db/client'
import { TrendingUp, Eye, Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react'
import { apiFetch } from '@/lib/utils/api'

interface PostWithMetrics {
  id: string
  format: string
  caption: string | null
  published_at: string | null
  metrics: {
    reach: number | null
    impressions: number | null
    likes: number | null
    comments: number | null
    saves: number | null
    shares: number | null
    video_views: number | null
  } | null
}

export default function AnalyticsPage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<PostWithMetrics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    try {
      const res = await apiFetch('/api/posts')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  const totalMetrics = posts.reduce((acc, p) => {
    if (p.metrics) {
      acc.reach += p.metrics.reach || 0
      acc.likes += p.metrics.likes || 0
      acc.comments += p.metrics.comments || 0
      acc.saves += p.metrics.saves || 0
      acc.shares += p.metrics.shares || 0
    }
    return acc
  }, { reach: 0, likes: 0, comments: 0, saves: 0, shares: 0 })

  const avgEngagement = posts.length > 0
    ? ((totalMetrics.likes + totalMetrics.comments + totalMetrics.saves) / Math.max(posts.length, 1)).toFixed(0)
    : '0'

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Analytics</h1>
      <p className="text-gray-500 text-sm mb-6">Performance metrics from your tracked posts.</p>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <MetricCard icon={Eye} label="Total Reach" value={totalMetrics.reach} />
        <MetricCard icon={Heart} label="Total Likes" value={totalMetrics.likes} />
        <MetricCard icon={MessageCircle} label="Comments" value={totalMetrics.comments} />
        <MetricCard icon={Bookmark} label="Saves" value={totalMetrics.saves} />
        <MetricCard icon={TrendingUp} label="Avg Engagement" value={Number(avgEngagement)} />
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : posts.length === 0 ? (
        <div className="bg-white border rounded-xl p-8 text-center text-gray-400">
          <p className="mb-2">No posts tracked yet.</p>
          <p className="text-sm">Import your posts from the Posts page or add them manually.</p>
          <a href="/content/posts" className="inline-block mt-4 text-sm text-brand-600 hover:underline">
            Go to Posts →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-gray-600">Post Performance</h2>
          {posts.map(post => (
            <div key={post.id} className="bg-white border rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{post.format}</span>
                  {post.published_at && (
                    <span className="text-xs text-gray-400">
                      {new Date(post.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 truncate">{post.caption || 'No caption'}</p>
              </div>
              {post.metrics && (
                <div className="flex gap-4 text-xs text-gray-500 shrink-0">
                  <span title="Reach">👁 {post.metrics.reach || 0}</span>
                  <span title="Likes">❤️ {post.metrics.likes || 0}</span>
                  <span title="Comments">💬 {post.metrics.comments || 0}</span>
                  <span title="Saves">🔖 {post.metrics.saves || 0}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Import CTA */}
      {posts.length === 0 && (
        <div className="mt-6 bg-brand-50 border border-brand-200 rounded-xl p-5">
          <h3 className="font-semibold text-brand-800 text-sm mb-1">Import Your Data</h3>
          <p className="text-xs text-brand-700">
            Export your Instagram insights and import them here to get AI-powered analysis.
            Go to Content → Posts to import.
          </p>
        </div>
      )}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: number
}) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <Icon className="w-4 h-4 text-gray-400 mb-1" />
      <p className="text-xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}
