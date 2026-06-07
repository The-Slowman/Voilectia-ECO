import { NextRequest } from 'next/server'
import { prisma } from './db'

export const ADMIN_COOKIE = 'voilectia_admin_session'

export const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'ANIMATOR', 'DEVELOPER', 'EDITOR'] as const
export type AdminRole = typeof ADMIN_ROLES[number]

export interface AdminUser {
  id:   string
  name: string
  role: string
}

/**
 * Vérifie le cookie admin et retourne l'utilisateur, ou null si non autorisé.
 * @param minRole  - rôle minimum requis. 'SUPER_ADMIN' = fondateur uniquement.
 *                   Si omis, accepte tous les rôles admin.
 */
export async function getAdminFromRequest(
  req: NextRequest,
  minRole?: 'SUPER_ADMIN',
): Promise<AdminUser | null> {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  if (!token) return null

  const where = minRole
    ? { adminToken: token, role: minRole }
    : { adminToken: token, role: { in: ADMIN_ROLES as unknown as string[] } }

  const user = await prisma.user.findFirst({
    where,
    select: { id: true, name: true, role: true },
  })

  return user ?? null
}
