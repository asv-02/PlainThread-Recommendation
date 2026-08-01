'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/db/client'
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { apiFetch } from '@/lib/utils/api'

interface CalendarEntry {
  id: string
  date: string
  content_type: string
  status: string
  caption: string | null
  platform: string
}

export default function CalendarPage() {
  const supabase = createClient()
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [showAdd, setShowAdd] = useState<string | null>(null)
  const [form, setForm] = useState({ content_type: 'reel', caption: '', status: 'idea' })

  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

  useEffect(() => {
    loadEntries()
  }, [currentWeek])

  async function loadEntries() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: brand } = await supabase.from('brands').select('id').eq('user_id', user.id).single()
    if (!brand) return
    const { data } = await supabase
      .from('content_calendar')
      .select('*')
      .eq('brand_id', brand.id)
      .gte('date', format(days[0], 'yyyy-MM-dd'))
      .lte('date', format(days[6], 'yyyy-MM-dd'))
    setEntries(data || [])
  }

  async function addEntry(date: string) {
    await apiFetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, content_type: form.content_type, caption: form.caption || null, status: form.status }),
    })
    setForm({ content_type: 'reel', caption: '', status: 'idea' })
    setShowAdd(null)
    loadEntries()
  }

  async function updateStatus(id: string, status: string) {
    await apiFetch('/api/calendar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    loadEntries()
  }

  function getEntriesForDay(date: Date) {
    return entries.filter(e => e.date === format(date, 'yyyy-MM-dd'))
  }

  const statusColors: Record<string, string> = {
    idea: 'bg-gray-100 text-gray-700',
    planned: 'bg-blue-100 text-blue-700',
    scheduled: 'bg-yellow-100 text-yellow-700',
    published: 'bg-green-100 text-green-700',
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Content Calendar</h1>
          <p className="text-gray-500 text-sm">Plan and track your content schedule.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="p-2 border rounded-lg hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
            Today
          </button>
          <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="p-2 border rounded-lg hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayEntries = getEntriesForDay(day)
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
          return (
            <div key={dateStr} className={`bg-white border rounded-lg p-3 min-h-[140px] ${isToday ? 'border-brand-300 ring-1 ring-brand-100' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs font-medium ${isToday ? 'text-brand-700' : 'text-gray-500'}`}>
                  {format(day, 'EEE d')}
                </p>
                <button
                  onClick={() => setShowAdd(showAdd === dateStr ? null : dateStr)}
                  className="text-gray-300 hover:text-brand-600 transition"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {showAdd === dateStr && (
                <div className="mb-2 space-y-1">
                  <select
                    value={form.content_type}
                    onChange={e => setForm(p => ({ ...p, content_type: e.target.value }))}
                    className="w-full px-1.5 py-1 border rounded text-[10px]"
                  >
                    <option value="reel">Reel</option>
                    <option value="carousel">Carousel</option>
                    <option value="single_post">Post</option>
                    <option value="story">Story</option>
                  </select>
                  <input
                    value={form.caption}
                    onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
                    placeholder="Note"
                    className="w-full px-1.5 py-1 border rounded text-[10px]"
                  />
                  <button
                    onClick={() => addEntry(dateStr)}
                    className="w-full px-1.5 py-1 bg-brand-600 text-white rounded text-[10px]"
                  >
                    Add
                  </button>
                </div>
              )}

              {dayEntries.map(entry => (
                <div key={entry.id} className={`text-[10px] px-1.5 py-1 rounded mb-1 cursor-pointer ${statusColors[entry.status] || statusColors.idea}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{entry.content_type}</span>
                    <select
                      value={entry.status}
                      onChange={e => updateStatus(entry.id, e.target.value)}
                      className="bg-transparent text-[9px] border-none p-0 cursor-pointer"
                      onClick={e => e.stopPropagation()}
                    >
                      <option value="idea">idea</option>
                      <option value="planned">planned</option>
                      <option value="scheduled">scheduled</option>
                      <option value="published">published</option>
                    </select>
                  </div>
                  {entry.caption && <p className="truncate mt-0.5 opacity-70">{entry.caption}</p>}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-gray-300" /> Idea</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-300" /> Planned</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-300" /> Scheduled</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-300" /> Published</span>
      </div>
    </div>
  )
}
