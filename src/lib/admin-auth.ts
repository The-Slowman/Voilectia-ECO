import { NextRequest } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { prisma } from './db'

export const ADMIN_COOKIE = 'voilectia_admin_session'

export const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'ANIMATOR', 'DEVELOPER', 'EDITOR'] as const
export type AdminRole = typeof ADMIN_ROLES[number]

// Durée de vie d'une session admin (7 jours)
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7

export interface AdminUser {
  id:   string
  name: string
  role: string
}

/**
 * Options de cookie sécurisées pour la session admin.
 * - httpOnly : inaccessible au JS client (anti-vol XSS)
 * - secure   : HTTPS uniquement en production
 * - sameSite : 'lax' (compatible redirections de login)
 */
export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge:   ADMIN_SESSION_MAX_AGE,
  path:     '/',
}

/** Hash SHA-256 d'un token (le token brut n'est jamais stocké en base). */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

/** Génère un token de session opaque (256 bits). */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Crée une session admin en base et retourne le token brut (à poser en cookie).
 * Seul le hash est persisté.
 */
/**
 * Filet de sécurité : crée la table admin_sessions si elle n'existe pas encore
 * (utile si la migration Prisma n'a pas été appliquée sur l'hébergement).
 */
let _ensuredTable = false
async function ensureAdminSessionTable(): Promise<void> {
  if (_ensuredTable) return
  await prisma.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS `admin_sessions` (' +
      '`id` VARCHAR(191) NOT NULL,' +
      '`tokenHash` VARCHAR(191) NOT NULL,' +
      '`userId` VARCHAR(191) NOT NULL,' +
      '`ipAddress` VARCHAR(191) NULL,' +
      '`userAgent` TEXT NULL,' +
      '`createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),' +
      '`expiresAt` DATETIME(3) NOT NULL,' +
      'UNIQUE INDEX `admin_sessions_tokenHash_key`(`tokenHash`),' +
      'INDEX `admin_sessions_userId_idx`(`userId`),' +
      'INDEX `admin_sessions_expiresAt_idx`(`expiresAt`),' +
      'PRIMARY KEY (`id`)' +
    ') DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
  )
  _ensuredTable = true
}

export async function createAdminSession(
  userId: string,
  meta?: { ip?: string | null; userAgent?: string | null },
): Promise<string> {
  const raw = generateSessionToken()
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_MAX_AGE * 1000)
  const data = {
    tokenHash: hashToken(raw),
    userId,
    expiresAt,
    ipAddress: meta?.ip ?? null,
    userAgent: meta?.userAgent ?? null,
  }

  try {
    await prisma.adminSession.create({ data })
  } catch {
    // La table n'existe peut-être pas encore → on la crée puis on réessaie.
    await ensureAdminSessionTable()
    await prisma.adminSession.create({ data })
  }

  return raw
}

/** Supprime une session (logout) à partir du token brut. */
export async function destroyAdminSession(rawToken: string): Promise<void> {
  try {
    await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(rawToken) } })
  } catch {
    /* best-effort */
  }
}

/**
 * Résout une session admin à partir du token brut du cookie.
 * Vérifie l'expiration, le rôle admin et l'état du compte (non banni).
 * Supprime au passage les sessions expirées (best-effort).
 */
export async function resolveAdminSession(
  rawToken: string | undefined | null,
  minRole?: 'SUPER_ADMIN',
): Promise<AdminUser | null> {
  if (!rawToken) return null

  try {
    const session = await prisma.adminSession.findUnique({
      where:   { tokenHash: hashToken(rawToken) },
      include: { user: { select: { id: true, name: true, role: true } } },
    })

    if (!session) return null

    // Session expirée → suppression et refus
    if (session.expiresAt.getTime() < Date.now()) {
      await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {})
      return null
    }

    const user = session.user
    if (!user) return null
    if (!ADMIN_ROLES.includes(user.role as AdminRole)) return null
    if (minRole && user.role !== minRole) return null

    return { id: user.id, name: user.name, role: user.role }
  } catch {
    return null
  }
}

/**
 * Vérifie le cookie admin d'une requête et retourne l'utilisateur, ou null.
 * @param minRole - 'SUPER_ADMIN' pour réserver au fondateur.
 */
export async function getAdminFromRequest(
  req: NextRequest,
  minRole?: 'SUPER_ADMIN',
): Promise<AdminUser | null> {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  return resolveAdminSession(token, minRole)
}
