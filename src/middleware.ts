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

// ── Cache paramètres maintenance ───────────────────────────
let maintenanceCache: {
  active:   boolean
  allowed:  string[]
  cachedAt: number
} | null = null

const CACHE_TTL = 15_000 // 15 secondes

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
    // En cas d'erreur : conserver le dernier état connu (fail-safe = maintenance active si déjà active)
    if (maintenanceCache) {
      return { active: maintenanceCache.active, allowed: maintenanceCache.allowed }
    }
    return { active: false, allowed: [] }
  }
}

// ── Routes toujours accessibles quoi qu'il arrive ──────────
// NB : /profil et les pages publiques NE sont PAS ici → soumises à la maintenance
const ALWAYS_ALLOWED = [
  '/maintenance',   // La page de maintenance elle-même
  '/admin',         // Panel admin (protégé séparément)
  '/api/',          // APIs (nécessaires au fonctionnement)
  '/connexion',     // Page de connexion
  '/inscription',   // Page d'inscription
  '/federation',    // Page statique (toujours accessible)
  '/soutenir',      // Page statique
  '/contact',       // Page de contact
  '/p/',            // Pages CMS custom
  '/actualites/',   // Articles/annonces (toujours accessibles)
]

// ── Mapping section admin → préfixes URL publics ───────────
const SECTION_PREFIXES: Record<string, string[]> = {
  'accueil':       ['/'],
  'presentation':  ['/presentation'],
  'forum':         ['/forum'],
  'tutoriels':     ['/tutoriels'],
  'guides':        ['/guides'],
  'changelog':     ['/changelog'],
  'faq':           ['/faq'],
  'top-serveur':   ['/top-serveur'],
  'sondage':       ['/sondage'],
  'recrutement':   ['/recrutement'],
  'giveaways':     ['/giveaways'],
  'suggestions':   ['/suggestions'],
  'evenements':    ['/evenements'],
  'villes':        ['/villes'],
  'staff':         ['/staff'],
  'reglement':     ['/reglement'],
  'economie':      ['/economie', '/serveur', '/progression'],
  'messagerie':    ['/messagerie'],
  'profil':        ['/profil'],
}

// ── Limites rate limiting ──────────────────────────────────
const API_RATE_LIMIT   = { limit: 60, windowMs: 60_000 }
const LOGIN_RATE_LIMIT = { limit: 5,  windowMs: 60_000 }

const LOGIN_ROUTES = [
  '/api/admin/auth/login',
  '/api/player/auth/login',
]

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
    if (isLoginRoute) {
      // Rate limit strict pour les routes de login : 5 tentatives/min
      if (!rateLimit(`login:${ip}`, LOGIN_RATE_LIMIT.limit, LOGIN_RATE_LIMIT.windowMs)) {
        return new NextResponse('Too Many Requests', { status: 429 })
      }
    } else {
      // Rate limit général : 60 req/min
      if (!rateLimit(ip, API_RATE_LIMIT.limit, API_RATE_LIMIT.windowMs)) {
        return new NextResponse('Too Many Requests', { status: 429 })
      }
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
  // Routes toujours accessibles (admin, api, connexion, maintenance)
  const isAlwaysAllowed = ALWAYS_ALLOWED.some(p =>
    p === '/' ? pathname === '/' : pathname.startsWith(p)
  )

  if (!isAlwaysAllowed) {
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`
    const { active, allowed } = await getMaintenanceStatus(baseUrl)

    if (active) {
      // Vérifier si le chemin est dans une section autorisée
      const isSectionAllowed = allowed.some(section => {
        const prefixes = SECTION_PREFIXES[section]
        if (!prefixes) return false
        return prefixes.some(prefix =>
          prefix === '/' ? pathname === '/' : pathname.startsWith(prefix)
        )
      })

      if (!isSectionAllowed) {
        return NextResponse.redirect(new URL('/maintenance', req.url))
      }
    }
  }

  // ── 4. Headers sécurité + pathname pour Server Components ─
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
