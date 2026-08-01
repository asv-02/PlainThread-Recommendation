'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/db/client'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Brain, Pencil, Users, BarChart3,
  CalendarDays, Lightbulb, Settings, Sparkles, LogOut,
  Film, TrendingUp, BookOpen,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/brand', label: 'Brand Brain', icon: Brain },
  { href: '/brand/memory', label: 'Memory', icon: BookOpen },
  { href: '/content', label: 'Content', icon: Pencil },
  { href: '/content/ideas', label: 'Idea Lab', icon: Lightbulb },
  { href: '/content/create', label: 'Create', icon: Film },
  { href: '/content/strategy', label: 'Strategy', icon: TrendingUp },
  { href: '/content/posts', label: 'Posts', icon: BarChart3 },
  { href: '/competitors', label: 'Competitors', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/ai/chat', label: 'AI Chat', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 border-r bg-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b">
        <h1 className="text-lg font-bold text-brand-700">Plain Thread AI</h1>
        <p className="text-xs text-gray-400">Social Media Manager</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && href !== '/brand' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 w-full transition"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  )
}
