import { cookies } from 'next/headers'
import { ADMIN_COOKIE, resolveAdminSession } from './admin-auth'

// ─── Types ────────────────────────────────────────────────────
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'PLAYER'

export const ROLES: Record<string, number> = {
  PLAYER:      0,
  EDITOR:      1,
  ADMIN:       2,
  SUPER_ADMIN: 3,
}

export function hasRole(userRole: string, requiredRole: UserRole): boolean {
  return (ROLES[userRole] ?? 0) >= (ROLES[requiredRole] ?? 0)
}

// ─── Auth admin — session hashée en base (voir lib/admin-auth) ──
export async function auth(): Promise<{ user: { id: string; name: string; role: string } } | null> {
  const tok = cookies().get(ADMIN_COOKIE)?.value
  const user = await resolveAdminSession(tok)
  if (!user) return null
  return { user }
}

// ─── Stubs NextAuth pour les imports existants ────────────────
export const handlers = { GET: () => new Response(null, { status: 404 }), POST: () => new Response(null, { status: 404 }) }
export const signIn   = async () => {}
export const signOut  = async () => {}
