import Link from 'next/link'
import { Lightbulb, MessageSquare, CalendarDays, Film, TrendingUp, BarChart3 } from 'lucide-react'

export default function ContentPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Content</h1>
      <p className="text-gray-500 text-sm mb-8">Create, critique, plan, and track your content.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ContentLink
          href="/content/ideas"
          icon={Lightbulb}
          title="Idea Generator"
          desc="Get AI-powered content ideas backed by evidence"
        />
        <ContentLink
          href="/content/create"
          icon={Film}
          title="Create Content"
          desc="Generate reel scripts, carousels, and shot lists"
        />
        <ContentLink
          href="/content/critic"
          icon={MessageSquare}
          title="Idea Critic"
          desc="Get your ideas scored and improved"
        />
        <ContentLink
          href="/content/strategy"
          icon={TrendingUp}
          title="Strategy"
          desc="AI-generated 7-day content plans"
        />
        <ContentLink
          href="/content/posts"
          icon={BarChart3}
          title="Posts"
          desc="Track and import published posts"
        />
        <ContentLink
          href="/calendar"
          icon={CalendarDays}
          title="Calendar"
          desc="Plan and schedule your content"
        />
      </div>
    </div>
  )
}

function ContentLink({ href, icon: Icon, title, desc }: {
  href: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string
}) {
  return (
    <Link href={href} className="bg-white border rounded-xl p-6 hover:border-brand-300 transition">
      <Icon className="w-6 h-6 text-brand-600 mb-3" />
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </Link>
  )
}
