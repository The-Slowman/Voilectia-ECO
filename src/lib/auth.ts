import { cookies } from 'next/headers'
import { prisma } from './db'

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

// ─── Auth admin — utilise adminToken (séparé du playerToken joueur) ──
export async function auth(): Promise<{ user: { id: string; name: string; email: string; role: string } } | null> {
  try {
    const tok = cookies().get('voilectia_admin_session')?.value
    if (!tok) return null

    // Recherche uniquement sur adminToken, jamais sur playerToken
    const user = await prisma.user.findFirst({
      where: { adminToken: tok, role: { not: 'PLAYER' } },
      select: { id: true, name: true, email: true, role: true },
    })

    if (!user) return null
    return { user }
  } catch {
    return null
  }
}

// ─── Stubs NextAuth pour les imports existants ────────────────
export const handlers = { GET: () => new Response(null, { status: 404 }), POST: () => new Response(null, { status: 404 }) }
export const signIn   = async () => {}
export const signOut  = async () => {}
