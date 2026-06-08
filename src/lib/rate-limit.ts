/**
 * Rate limiting pluggable.
 *
 * - Si UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN sont définis :
 *   utilise Upstash Redis (REST, compatible Edge/serverless) → partagé entre
 *   toutes les instances, persistant.
 * - Sinon : fallback in-memory (Map). ⚠️ Par-instance uniquement — correct sur
 *   un hébergement Node mono-instance (Hostinger), insuffisant en serverless
 *   multi-instances. Le fallback est volontairement "fail-open" en cas d'erreur
 *   pour ne jamais bloquer le site.
 *
 * API : rateLimit(key, limit, windowMs) → Promise<boolean> (true = autorisé).
 */

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const USE_UPSTASH   = !!(UPSTASH_URL && UPSTASH_TOKEN)

// ── Fallback in-memory ───────────────────────────────────────
interface RateEntry { count: number; reset: number }
const store = new Map<string, RateEntry>()

function memoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now   = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

// Nettoyage périodique des entrées expirées (mono-instance only)
if (!USE_UPSTASH && typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, val] of store) {
      if (now > val.reset) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

// ── Upstash Redis (REST) ─────────────────────────────────────
async function upstashRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    const headers = { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    const k = encodeURIComponent(`rl:${key}`)

    const incrRes = await fetch(`${UPSTASH_URL}/incr/${k}`, { headers, cache: 'no-store' })
    if (!incrRes.ok) return true // fail-open
    const { result: count } = (await incrRes.json()) as { result: number }

    // Première requête de la fenêtre → poser l'expiration
    if (count === 1) {
      await fetch(`${UPSTASH_URL}/pexpire/${k}/${windowMs}`, { headers, cache: 'no-store' }).catch(() => {})
    }

    return count <= limit
  } catch {
    return true // fail-open : ne jamais casser le site sur une erreur réseau
  }
}

/**
 * Vérifie et incrémente le compteur pour `key`.
 * @returns true si la requête est autorisée, false si la limite est dépassée.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (USE_UPSTASH) return upstashRateLimit(key, limit, windowMs)
  return memoryRateLimit(key, limit, windowMs)
}

/** Indique quelle stratégie est active (utile pour les logs/diagnostics). */
export const rateLimitBackend = USE_UPSTASH ? 'upstash' : 'memory'
