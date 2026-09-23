import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { randomUUID } from 'node:crypto'

const publicPaths = ['/login', '/register', '/auth', '/api/auth', '/setup', '/forbidden', '/api/health']

function securityHeaders(response: NextResponse, csp: string) {
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  return response
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(randomUUID()).toString('base64')
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "media-src 'self' blob: https://*.supabase.co",
    "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "form-action 'self' https:",
  ].join('; ')
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('Content-Security-Policy', csp)
  requestHeaders.set('x-nonce', nonce)

  const path = request.nextUrl.pathname
  const isPublic = publicPaths.some((route) => path === route || path.startsWith(`${route}/`))
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    if (path === '/setup') return securityHeaders(NextResponse.next({ request: { headers: requestHeaders } }), csp)
    return securityHeaders(NextResponse.redirect(new URL('/setup', request.url)), csp)
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } })
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request: { headers: requestHeaders } })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        securityHeaders(response, csp)
      },
    },
  })

  if (isPublic) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && (path === '/login' || path === '/register')) {
      return securityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)), csp)
    }
    return securityHeaders(response, csp)
  }

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return securityHeaders(NextResponse.redirect(new URL('/login', request.url)), csp)

  if (path === '/admin' || path.startsWith('/admin/')) {
    const { data: account, error: roleError } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
    if (roleError || !['admin', 'super_admin'].includes(account?.role ?? '')) {
      return securityHeaders(NextResponse.redirect(new URL('/forbidden', request.url)), csp)
    }
  }

  return securityHeaders(response, csp)
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.png$).*)'] }
