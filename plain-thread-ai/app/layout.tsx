import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthGuard } from '@/components/auth-guard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Plain Thread AI — Social Media Manager',
  description: 'AI-powered social media manager for Plain Thread',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  )
}
