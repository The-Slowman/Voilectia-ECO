import { NextRequest, NextResponse } from 'next/server'

// ── Rate limiting en mémoire (par IP) ──────────────────────
interface RateEntry { count: number; reset: number }
const rateLimitStore = new Map<string, RateEntry>()

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now   = Date.now()
  const entry = rateLimitStore.get(ip)
  if (!entry || now > entry.reset) {
    rateLimitStore.set(ip, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, val] of rateLimitStore) {
      if (now > val.reset) rateLimitStore.delete(key)
    }
  }, 5 * 60 * 1000)
}

// ── Cache paramètres maintenance (évite un appel DB par requête) ──
let maintenanceCache: {
  active:   boolean
  allowed:  string[]
  cachedAt: number
} | null = null

const CACHE_TTL = 30_000 // 30 secondes

async function getMaintenanceStatus(baseUrl: string): Promise<{ active: boolean; allowed: string[] }> {
  const now = Date.now()
  if (maintenanceCache && now - maintenanceCache.cachedAt < CACHE_TTL) {
    return { active: maintenanceCache.active, allowed: maintenanceCache.allowed }
  }
  try {
    const res  = await fetch(`${baseUrl}/api/settings`, { cache: 'no-store' })
    const data = await res.json()
    maintenanceCache = {
      active:   !!data.maintenanceActive,
      allowed:  Array.isArray(data.allowedSections) ? data.allowedSections : [],
      cachedAt: now,
    }
    return { active: maintenanceCache.active, allowed: maintenanceCache.allowed }
  } catch {
    return { active: false, allowed: [] }
  }
}

// Routes TOUJOURS accessibles (quelle que soit la maintenance)
const ALWAYS_ALLOWED = [
  '/maintenance',
  '/admin',
  '/api/',
  '/profil',
  '/_next',
  '/images',
  '/favicon',
]

// Mapping section → préfixe URL
const SECTION_PREFIXES: Record<string, string> = {
  'forum':       '/forum',
  'tutoriels':   '/tutoriels',
  'top-serveur': '/top-serveur',
  'sondage':     '/sondage',
  'recrutement': '/recrutement',
}

// ── Limites rate limiting ──────────────────────────────────
const API_RATE_LIMIT   = { limit: 60, windowMs: 60_000 }
const AUTH_RATE_LIMIT  = { limit: 10, windowMs: 60_000 }
const STEAM_RATE_LIMIT = { limit: 20, windowMs: 60_000 }

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ip =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '127.0.0.1'

  // ── 1. Rate limiting ──────────────────────────────────────
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/admin/auth') && !pathname.startsWith('/api/auth')) {
    if (!rateLimit(ip, API_RATE_LIMIT.limit, API_RATE_LIMIT.windowMs)) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }

  // ── 2. Protection routes admin ────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionToken = req.cookies.get('voilectia_admin_session')?.value
    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── 3. Mode maintenance ───────────────────────────────────
  // Ignorer les assets statiques
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // fichiers statiques (.png, .ico, .svg…)
  ) {
    return NextResponse.next()
  }

  // Routes toujours accessibles
  const isAlwaysAllowed = ALWAYS_ALLOWED.some(p => pathname.startsWith(p))
  if (!isAlwaysAllowed) {
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`
    const { active, allowed } = await getMaintenanceStatus(baseUrl)

    if (active) {
      // Vérifier si la section actuelle est dans les autorisées
      const isSectionAllowed = allowed.some(section => {
        const prefix = SECTION_PREFIXES[section]
        return prefix && pathname.startsWith(prefix)
      })

      if (!isSectionAllowed && pathname !== '/maintenance') {
        return NextResponse.redirect(new URL('/maintenance', req.url))
      }
    }
  }

  // ── 4. Headers sécurité sur les API ──────────────────────
  const res = NextResponse.next()
  if (pathname.startsWith('/api/')) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.headers.set('X-Content-Type-Options', 'nosniff')
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
