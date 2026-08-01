'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/db/client'
import { useRouter } from 'next/navigation'

export default function BrandPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [brand, setBrand] = useState({
    name: '',
    description: '',
    mission: '',
    positioning: '',
    target_audience: '',
    tone_of_voice: '',
    visual_style: '',
    brand_values: '',
    product_categories: '',
    pricing_position: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('brands').select('*').eq('user_id', user.id).single()
      if (data) {
        setBrand({
          name: data.name || '',
          description: data.description || '',
          mission: data.mission || '',
          positioning: data.positioning || '',
          target_audience: data.target_audience || '',
          tone_of_voice: data.tone_of_voice || '',
          visual_style: data.visual_style || '',
          brand_values: data.brand_values?.join(', ') || '',
          product_categories: data.product_categories?.join(', ') || '',
          pricing_position: data.pricing_position || '',
        })
      }
    }
    load()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      name: brand.name,
      description: brand.description || null,
      mission: brand.mission || null,
      positioning: brand.positioning || null,
      target_audience: brand.target_audience || null,
      tone_of_voice: brand.tone_of_voice || null,
      visual_style: brand.visual_style || null,
      brand_values: brand.brand_values ? brand.brand_values.split(',').map(s => s.trim()) : null,
      product_categories: brand.product_categories ? brand.product_categories.split(',').map(s => s.trim()) : null,
      pricing_position: brand.pricing_position || null,
    }

    const { data: existing } = await supabase.from('brands').select('id').eq('user_id', user.id).single()

    if (existing) {
      await supabase.from('brands').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('brands').insert(payload)
    }

    setLoading(false)
    router.push('/dashboard')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Brand Brain</h1>
      <p className="text-gray-500 text-sm mb-8">
        This is how the AI understands your brand. The more complete, the better.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="Brand Name" value={brand.name} onChange={v => setBrand(p => ({ ...p, name: v }))} required />
        <Field label="Description" value={brand.description} onChange={v => setBrand(p => ({ ...p, description: v }))} textarea />
        <Field label="Mission" value={brand.mission} onChange={v => setBrand(p => ({ ...p, mission: v }))} textarea />
        <Field label="Positioning" value={brand.positioning} onChange={v => setBrand(p => ({ ...p, positioning: v }))} />
        <Field label="Target Audience" value={brand.target_audience} onChange={v => setBrand(p => ({ ...p, target_audience: v }))} textarea />
        <Field label="Tone of Voice" value={brand.tone_of_voice} onChange={v => setBrand(p => ({ ...p, tone_of_voice: v }))} />
        <Field label="Visual Style" value={brand.visual_style} onChange={v => setBrand(p => ({ ...p, visual_style: v }))} />
        <Field label="Brand Values (comma separated)" value={brand.brand_values} onChange={v => setBrand(p => ({ ...p, brand_values: v }))} />
        <Field label="Product Categories (comma separated)" value={brand.product_categories} onChange={v => setBrand(p => ({ ...p, product_categories: v }))} />
        <Field label="Pricing Position" value={brand.pricing_position} onChange={v => setBrand(p => ({ ...p, pricing_position: v }))} />

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
        >
          {loading ? 'Saving...' : 'Save Brand Profile'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, textarea, required }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean; required?: boolean
}) {
  const cls = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} required={required} className={`${cls} min-h-[80px]`} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} required={required} className={cls} />
      )}
    </div>
  )
}
