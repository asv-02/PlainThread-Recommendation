'use client'

import { useState } from 'react'
import { Film, LayoutGrid, Camera } from 'lucide-react'
import { apiFetch } from '@/lib/utils/api'

type ContentType = 'reel' | 'carousel' | 'shot-list'

interface ReelScript {
  title: string
  duration_seconds: number
  hook: { text: string; visual: string }
  body: { timestamp: string; narration: string; visual: string; text_overlay: string | null }[]
  cta: { text: string; visual: string }
  music_suggestion: string
  hashtags: string[]
  caption: string
  production_notes: string[]
}

interface CarouselData {
  title: string
  slides: { slide_number: number; headline: string; body_text: string; visual_direction: string }[]
  caption: string
  hashtags: string[]
  cta: string
}

interface ShotListData {
  title: string
  total_shots: number
  estimated_time: string
  equipment_needed: string[]
  shots: { shot_number: number; description: string; angle: string; lighting: string; props: string[]; notes: string | null }[]
  styling_notes: string
  location_suggestions: string[]
}

export default function CreatePage() {
  const [type, setType] = useState<ContentType>('reel')
  const [concept, setConcept] = useState('')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [reelScript, setReelScript] = useState<ReelScript | null>(null)
  const [carousel, setCarousel] = useState<CarouselData | null>(null)
  const [shotList, setShotList] = useState<ShotListData | null>(null)

  async function generate() {
    if (!concept) return
    setLoading(true)
    setReelScript(null)
    setCarousel(null)
    setShotList(null)

    const endpoint = type === 'reel' ? '/api/ai/reel-script'
      : type === 'carousel' ? '/api/ai/carousel'
      : '/api/ai/shot-list'

    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, goal, format: type }),
      })
      const data = await res.json()

      if (type === 'reel') setReelScript(data)
      else if (type === 'carousel') setCarousel(data)
      else setShotList(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Create Content</h1>
      <p className="text-gray-500 text-sm mb-6">Generate ready-to-produce content scripts and plans.</p>

      {/* Type Selection */}
      <div className="flex gap-2 mb-6">
        <TypeBtn icon={Film} label="Reel Script" active={type === 'reel'} onClick={() => setType('reel')} />
        <TypeBtn icon={LayoutGrid} label="Carousel" active={type === 'carousel'} onClick={() => setType('carousel')} />
        <TypeBtn icon={Camera} label="Shot List" active={type === 'shot-list'} onClick={() => setType('shot-list')} />
      </div>

      {/* Input */}
      <div className="space-y-3 mb-6">
        <input
          value={concept}
          onChange={e => setConcept(e.target.value)}
          placeholder="What's the content about? (e.g., behind the scenes of our new collection)"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
        />
        <input
          value={goal}
          onChange={e => setGoal(e.target.value)}
          placeholder="Goal (optional — e.g., drive traffic, increase saves)"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={generate}
          disabled={loading || !concept}
          className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50 transition"
        >
          {loading ? 'Generating...' : `Generate ${type === 'reel' ? 'Script' : type === 'carousel' ? 'Carousel' : 'Shot List'}`}
        </button>
      </div>

      {/* Reel Script Output */}
      {reelScript && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="font-semibold text-lg">{reelScript.title}</h2>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{reelScript.duration_seconds}s</span>
          </div>

          <div className="bg-brand-50 rounded-lg p-4">
            <p className="text-xs text-brand-600 font-medium mb-1">HOOK (0-3s)</p>
            <p className="text-sm font-medium">{reelScript.hook?.text || ''}</p>
            <p className="text-xs text-gray-500 mt-1">Visual: {reelScript.hook?.visual || ''}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">BODY</p>
            {reelScript.body?.map((segment, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                <span className="text-xs text-gray-400">{segment.timestamp}</span>
                <p className="mt-1">{segment.narration}</p>
                <p className="text-xs text-gray-500 mt-1">Visual: {segment.visual}</p>
                {segment.text_overlay && <p className="text-xs text-brand-600 mt-1">Text: {segment.text_overlay}</p>}
              </div>
            ))}
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-green-600 font-medium mb-1">CTA</p>
            <p className="text-sm">{reelScript.cta?.text || ''}</p>
            <p className="text-xs text-gray-500 mt-1">Visual: {reelScript.cta?.visual || ''}</p>
          </div>

          <div className="border-t pt-4 space-y-2">
            <p className="text-sm"><strong>Music:</strong> {reelScript.music_suggestion}</p>
            <p className="text-sm"><strong>Caption:</strong> {reelScript.caption}</p>
            <p className="text-sm"><strong>Hashtags:</strong> {reelScript.hashtags?.join(' ') || ''}</p>
            {reelScript.production_notes?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">PRODUCTION NOTES</p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {reelScript.production_notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Carousel Output */}
      {carousel && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">{carousel.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {carousel.slides?.map(slide => (
              <div key={slide.slide_number} className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Slide {slide.slide_number}</p>
                <p className="font-medium text-sm">{slide.headline}</p>
                <p className="text-sm text-gray-600 mt-1">{slide.body_text}</p>
                <p className="text-xs text-gray-400 mt-2 italic">{slide.visual_direction}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <p className="text-sm"><strong>Caption:</strong> {carousel.caption}</p>
            <p className="text-sm"><strong>CTA:</strong> {carousel.cta}</p>
            <p className="text-sm"><strong>Hashtags:</strong> {carousel.hashtags?.join(' ') || ''}</p>
          </div>
        </div>
      )}

      {/* Shot List Output */}
      {shotList && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="font-semibold text-lg">{shotList.title}</h2>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{shotList.total_shots} shots · {shotList.estimated_time}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {shotList.equipment_needed?.map((eq, i) => (
              <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{eq}</span>
            ))}
          </div>

          <div className="space-y-2">
            {shotList.shots?.map(shot => (
              <div key={shot.shot_number} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded">#{shot.shot_number}</span>
                  <span className="text-xs text-gray-400">{shot.angle} · {shot.lighting}</span>
                </div>
                <p className="text-sm">{shot.description}</p>
                {shot.props?.length > 0 && <p className="text-xs text-gray-500 mt-1">Props: {shot.props.join(', ')}</p>}
                {shot.notes && <p className="text-xs text-gray-400 mt-1 italic">{shot.notes}</p>}
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <p className="text-sm"><strong>Styling:</strong> {shotList.styling_notes}</p>
            <p className="text-sm"><strong>Locations:</strong> {shotList.location_suggestions?.join(', ') || ''}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function TypeBtn({ icon: Icon, label, active, onClick }: {
  icon: React.ComponentType<{ className?: string }>; label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
        active ? 'bg-brand-600 text-white' : 'bg-white border text-gray-600 hover:border-brand-300'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  )
}
