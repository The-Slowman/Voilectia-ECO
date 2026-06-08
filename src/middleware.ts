import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

// ── Limites rate limiting ──────────────────────────────────
const API_RATE_LIMIT   = { limit: 60, windowMs: 60_000 }
const LOGIN_RATE_LIMIT = { limit: 5,  windowMs: 60_000 }

const LOGIN_ROUTES = [
  '/api/admin/auth/login',
  '/api/player/auth/login',
]

/**
 * Middleware (runtime Edge) — ne dépend NI de la base NI d'un fetch interne.
 * Responsabilités : rate limiting, garde de présence du cookie admin,
 * en-têtes de sécurité, exposition du pathname.
 *
 * La logique de maintenance est gérée côté Server Component dans
 * (site)/layout.tsx via lib/settings — afin que le middleware reste robuste
 * même si la BDD ou l'API est instable.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ip =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '127.0.0.1'

  // ── Assets statiques — bypass immédiat ───────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // ── 1. Rate limiting API ──────────────────────────────────
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    const isLoginRoute = LOGIN_ROUTES.includes(pathname)
    const allowed = isLoginRoute
      ? await rateLimit(`login:${ip}`, LOGIN_RATE_LIMIT.limit, LOGIN_RATE_LIMIT.windowMs)
      : await rateLimit(`api:${ip}`,   API_RATE_LIMIT.limit,   API_RATE_LIMIT.windowMs)

    if (!allowed) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }

  // ── 2. Protection routes admin (présence du cookie) ───────
  // La validation réelle de la session se fait dans admin/layout.tsx + les routes.
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionToken = req.cookies.get('voilectia_admin_session')?.value
    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── 3. En-têtes sécurité + pathname pour Server Components ─
  const res = NextResponse.next()
  res.headers.set('x-pathname', pathname)

  if (pathname.startsWith('/api/')) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.headers.set('X-Content-Type-Options', 'nosniff')
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
