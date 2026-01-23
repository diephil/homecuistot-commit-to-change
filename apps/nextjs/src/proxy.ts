import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Create Supabase client for auth checks
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {}, // No-op for middleware (readonly)
      },
    }
  )

  // Admin route protection (/admin/*)
  if (pathname.startsWith('/admin')) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        console.error('[Proxy] Supabase auth error:', error)
        return NextResponse.next() // Graceful degradation for MVP
      }

      // Redirect unauthenticated users to login
      if (!user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Check admin role
      const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || []

      if (!process.env.ADMIN_USER_IDS) {
        console.error('[Proxy] ADMIN_USER_IDS not configured')
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      const isAdmin = user.id && adminIds.includes(user.id)

      if (!isAdmin) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      // Allow admin access
      return NextResponse.next()
    } catch (err) {
      console.error('[Proxy] Unexpected error:', err)
      return NextResponse.next() // Graceful degradation
    }
  }

  // Protected app route authentication (/app/*)
  if (pathname.startsWith('/app')) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        console.error('[Proxy] Supabase auth error:', error)
        return NextResponse.next() // Graceful degradation for MVP
      }

      // Redirect unauthenticated users to login
      if (!user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Allow authenticated access
      return NextResponse.next()
    } catch (err) {
      console.error('[Proxy] Unexpected error:', err)
      return NextResponse.next() // Graceful degradation
    }
  }

  // Allow access to all other routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',

    // Protected app routes
    '/app/:path*',

    // Exclude static files and internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
