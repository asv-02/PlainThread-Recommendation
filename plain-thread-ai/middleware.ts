import { NextResponse, type NextRequest } from 'next/server'

// Simplified middleware - no auth checks here
// Auth is handled client-side via the layout/pages
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
