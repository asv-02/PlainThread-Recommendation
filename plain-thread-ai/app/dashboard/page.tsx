'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/db/client'
import Link from 'next/link'
import { Sparkles, CalendarDays, Users, TrendingUp, Lightbulb } from 'lucide-react'
import { apiFetch } from '@/lib/utils/api'

interface DailyBrief {
  recommendation: { format: string; topic: string; hook: string; why: string }
  best_time: string
  quick_win: { idea: string; effort: string }
  insight: string
  motivation: string
}

interface Stats {
  ideas: number
  scheduled: number
  competitors: number
  posts: number
}

export default function DashboardPage() {
  const supabase = createClient()
  const [brand, setBrand] = useState<Record<string, unknown> | null>(null)
  const [brief, setBrief] = useState<DailyBrief | null>(null)
  const [stats, setStats] = useState<Stats>({ ideas: 0, scheduled: 0, competitors: 0, posts: 0 })
  const [loadingBrief, setLoadingBrief] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: brandData } = await supabase.from('brands').select('*').eq('user_id', user.id).single()
    setBrand(brandData)

    if (brandData) {
      const [ideas, calendar, competitors, posts] = await Promise.all([
        supabase.from('content_ideas').select('id', { count: 'exact', head: true }).eq('brand_id', brandData.id),
        supabase.from('content_calendar').select('id', { count: 'exact', head: true }).eq('brand_id', brandData.id).eq('status', 'scheduled'),
        supabase.from('competitors').select('id', { count: 'exact', head: true }).eq('brand_id', brandData.id),
        supabase.from('social_posts').select('id', { count: 'exact', head: true }).eq('brand_id', brandData.id),
      ])
      setStats({
        ideas: ideas.count || 0,
        scheduled: calendar.count || 0,
        competitors: competitors.count || 0,
        posts: posts.count || 0,
      })
    }
  }

  async function fetchBrief() {
    setLoadingBrief(true)
    try {
      const res = await apiFetch('/api/ai/daily-brief')
      const data = await res.json()
      if (!data.error) setBrief(data)
    } catch { /* ignore */ }
    setLoadingBrief(false)
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">
        {brand ? `${brand.name}` : 'Plain Thread'} Dashboard 👋
      </h1>
      <p className="text-gray-500 mb-6">Your daily content command center</p>

      {!brand && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-brand-800 mb-2">Set up your brand</h2>
          <p className="text-sm text-brand-700 mb-4">
            Tell us about your brand so the AI can generate relevant content and strategy.
          </p>
          <Link href="/brand" className="inline-block px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition">
            Set Up Brand Brain
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Lightbulb} label="Ideas" value={stats.ideas} href="/content/ideas" />
        <StatCard icon={CalendarDays} label="Scheduled" value={stats.scheduled} href="/calendar" />
        <StatCard icon={Users} label="Competitors" value={stats.competitors} href="/competitors" />
        <StatCard icon={TrendingUp} label="Posts Tracked" value={stats.posts} href="/analytics" />
      </div>

      {/* Daily Brief */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" /> Daily Brief
          </h2>
          {brand && (
            <button
              onClick={fetchBrief}
              disabled={loadingBrief}
              className="text-sm px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
            >
              {loadingBrief ? 'Generating...' : brief ? 'Refresh' : 'Get Brief'}
            </button>
          )}
        </div>

        {!brand && (
          <p className="text-gray-400 text-sm">Set up your brand to get daily AI recommendations.</p>
        )}

        {brief && (
          <div className="space-y-4">
            <div className="bg-brand-50 rounded-lg p-4">
              <p className="text-xs text-brand-600 font-medium mb-1">TODAY&apos;S RECOMMENDATION</p>
              <p className="font-medium">{brief.recommendation.topic}</p>
              <p className="text-sm text-gray-600 mt-1">Format: {brief.recommendation.format} · Hook: &quot;{brief.recommendation.hook}&quot;</p>
              <p className="text-xs text-gray-500 mt-1">{brief.recommendation.why}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-medium">BEST TIME TO POST</p>
                <p className="text-sm font-medium mt-1">{brief.best_time}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-medium">QUICK WIN ({brief.quick_win.effort} effort)</p>
                <p className="text-sm font-medium mt-1">{brief.quick_win.idea}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-medium">INSIGHT</p>
              <p className="text-sm mt-1">{brief.insight}</p>
            </div>
            {brief.motivation && (
              <p className="text-sm text-gray-500 italic">{brief.motivation}</p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction href="/content/ideas" label="Generate Ideas" />
        <QuickAction href="/content/create" label="Create Content" />
        <QuickAction href="/ai/chat" label="AI Chat" />
        <QuickAction href="/content/strategy" label="Strategy Plan" />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, href }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: number; href: string
}) {
  return (
    <Link href={href} className="bg-white border rounded-xl p-4 hover:border-brand-300 transition">
      <Icon className="w-4 h-4 text-gray-400 mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </Link>
  )
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="bg-white border rounded-lg p-3 text-center text-sm hover:border-brand-300 hover:text-brand-700 transition">
      {label}
    </Link>
  )
}
