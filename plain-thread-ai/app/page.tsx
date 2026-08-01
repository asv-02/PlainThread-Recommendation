import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Plain Thread AI</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Your AI-powered social media manager. Strategy, content, and intelligence — all in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
        >
          Log In
        </Link>
        <Link
          href="/signup"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:border-brand-600 transition"
        >
          Sign Up
        </Link>
      </div>
    </main>
  )
}
