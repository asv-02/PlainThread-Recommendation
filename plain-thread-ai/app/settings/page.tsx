'use client'

import { useState } from 'react'
import { createClient } from '@/lib/db/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [exporting, setExporting] = useState(false)

  async function exportData() {
    setExporting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: brand } = await supabase.from('brands').select('*').eq('user_id', user.id).single()
      if (!brand) return

      const [ideas, calendar, competitors, posts, memories] = await Promise.all([
        supabase.from('content_ideas').select('*').eq('brand_id', brand.id),
        supabase.from('content_calendar').select('*').eq('brand_id', brand.id),
        supabase.from('competitors').select('*').eq('brand_id', brand.id),
        supabase.from('social_posts').select('*').eq('brand_id', brand.id),
        supabase.from('brand_memory').select('*').eq('brand_id', brand.id),
      ])

      const exportObj = {
        exported_at: new Date().toISOString(),
        brand,
        content_ideas: ideas.data || [],
        content_calendar: calendar.data || [],
        competitors: competitors.data || [],
        social_posts: posts.data || [],
        brand_memory: memories.data || [],
      }

      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `plain-thread-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* ignore */ }
    setExporting(false)
  }

  async function handleDeleteAccount() {
    if (!confirm('Are you sure? This will delete all your data.')) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // Delete brand (cascades to everything)
    await supabase.from('brands').delete().eq('user_id', user.id)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Manage your account, AI, and data.</p>

      <div className="space-y-4">
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-1">AI Provider</h3>
          <p className="text-sm text-gray-500 mb-2">Currently using OpenAI. Models configured via environment variables.</p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Default model: AI_MODEL (gpt-4o)</p>
            <p>Cheap model: AI_MODEL_CHEAP (gpt-4o-mini)</p>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-1">Data Export</h3>
          <p className="text-sm text-gray-500 mb-3">Export all your data as JSON.</p>
          <button
            onClick={exportData}
            disabled={exporting}
            className="px-4 py-2 border rounded-lg text-sm hover:border-brand-300 disabled:opacity-50 transition"
          >
            {exporting ? 'Exporting...' : 'Export All Data'}
          </button>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-semibold mb-1">Brand Memory</h3>
          <p className="text-sm text-gray-500 mb-3">View and manage what the AI has learned about your brand.</p>
          <a href="/brand/memory" className="text-sm text-brand-600 hover:underline">
            Manage Brand Memory →
          </a>
        </div>

        <div className="bg-white border border-red-200 rounded-xl p-5">
          <h3 className="font-semibold text-red-700 mb-1">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-3">Permanently delete your account and all data.</p>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
