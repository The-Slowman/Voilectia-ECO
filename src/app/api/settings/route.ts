import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { ensureSiteSettingsSchema } from '@/lib/site-settings-heal'

// Champs de base — toujours présents en DB
const BASE_DEFAULTS = {
  id:                 'singleton',
  maintenanceActive:  false,
  maintenanceTitle:   'Saison 2 — Bientôt disponible',
  maintenanceMessage: 'Le serveur se prépare pour une nouvelle aventure. Restez connectés !',
  launchDate:         null,
  allowedSections:    JSON.stringify(['forum', 'tutoriels', 'top-serveur']),
  ecoMapEnabled:      false,
  ecoMapUrl:          '',
  ecoMapTitle:        'Carte du monde',
  siteDiscordUrl:     process.env.NEXT_PUBLIC_DISCORD_URL ?? 'https://discord.gg/voilectia',
  siteServerIp:       '',
  updatedBy:          null,
}

// Nouveaux champs (peuvent être absents si la migration SQL n'a pas encore été exécutée)
const NEW_FIELD_DEFAULTS = {
  announcementEnabled: false,
  announcementText:    null as string | null,
  homeHeroTitle:       null as string | null,
  homeHeroSubtitle:    null as string | null,
}

function buildResponse(settings: Record<string, unknown>, extra: typeof NEW_FIELD_DEFAULTS) {
  const raw = settings.allowedSections
  const allowedSections = typeof raw === 'string'
    ? (JSON.parse(raw) as string[])
    : (Array.isArray(raw) ? raw : [])

  return NextResponse.json({
    ...settings,
    ...extra,
    allowedSections,
  })
}

// GET — public (pour le middleware et la page maintenance)
export async function GET() {
  try {
    await ensureSiteSettingsSchema()
    // Tentative avec tous les champs (nouveaux + anciens)
    let settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { ...BASE_DEFAULTS, ...NEW_FIELD_DEFAULTS },
      })
    }
    return buildResponse(
      settings as unknown as Record<string, unknown>,
      {
        announcementEnabled: (settings as Record<string, unknown>).announcementEnabled as boolean ?? false,
        announcementText:    (settings as Record<string, unknown>).announcementText    as string | null ?? null,
        homeHeroTitle:       (settings as Record<string, unknown>).homeHeroTitle       as string | null ?? null,
        homeHeroSubtitle:    (settings as Record<string, unknown>).homeHeroSubtitle    as string | null ?? null,
      }
    )
  } catch (err) {
    // Les nouvelles colonnes n'existent pas encore en DB → fallback sans elles
    console.warn('[settings GET] Fallback sans nouvelles colonnes:', (err as Error).message?.slice(0, 80))

    const settings = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM site_settings WHERE id = 'singleton' LIMIT 1
    `.then(rows => rows[0] ?? null)

    if (!settings) {
      await prisma.$executeRaw`
        INSERT IGNORE INTO site_settings (id, maintenanceActive, maintenanceTitle,
          maintenanceMessage, allowedSections, ecoMapEnabled, ecoMapUrl, ecoMapTitle)
        VALUES ('singleton', 0, 'Saison 2 — Bientôt disponible',
          'Le serveur se prépare pour une nouvelle aventure.', '["forum","tutoriels","top-serveur"]', 0, '', 'Carte du monde')
      `
      return NextResponse.json({ ...BASE_DEFAULTS, ...NEW_FIELD_DEFAULTS, allowedSections: ['forum', 'tutoriels', 'top-serveur'] })
    }

    return buildResponse(settings, NEW_FIELD_DEFAULTS)
  }
}

// PATCH — Fondateur (SUPER_ADMIN) uniquement
export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromRequest(req, 'SUPER_ADMIN')
  if (!admin) {
    return NextResponse.json({ error: 'Réservé aux fondateurs' }, { status: 403 })
  }

  await ensureSiteSettingsSchema()

  const body = await req.json()
  const data: Record<string, unknown> = {}

  if ('maintenanceActive'  in body) data.maintenanceActive  = body.maintenanceActive
  if ('maintenanceTitle'   in body) data.maintenanceTitle   = body.maintenanceTitle
  if ('maintenanceMessage' in body) data.maintenanceMessage = body.maintenanceMessage
  if ('launchDate'         in body) data.launchDate = body.launchDate ? new Date(body.launchDate) : null
  if ('allowedSections'    in body) data.allowedSections = JSON.stringify(body.allowedSections)
  if ('siteDiscordUrl'     in body) data.siteDiscordUrl = body.siteDiscordUrl
  if ('siteServerIp'       in body) data.siteServerIp   = body.siteServerIp
  data.updatedBy = admin.name

  // Nouveaux champs — tentative conditionnelle
  const newFields: Record<string, unknown> = {}
  if ('announcementEnabled' in body) newFields.announcementEnabled = body.announcementEnabled
  if ('announcementText'    in body) newFields.announcementText    = body.announcementText || null
  if ('homeHeroTitle'       in body) newFields.homeHeroTitle       = body.homeHeroTitle    || null
  if ('homeHeroSubtitle'    in body) newFields.homeHeroSubtitle    = body.homeHeroSubtitle || null

  try {
    const settings = await prisma.siteSettings.upsert({
      where:  { id: 'singleton' },
      update: { ...data, ...newFields },
      create: { ...BASE_DEFAULTS, ...NEW_FIELD_DEFAULTS, ...data, ...newFields },
    })
    return buildResponse(
      settings as unknown as Record<string, unknown>,
      {
        announcementEnabled: (settings as Record<string, unknown>).announcementEnabled as boolean ?? false,
        announcementText:    (settings as Record<string, unknown>).announcementText    as string | null ?? null,
        homeHeroTitle:       (settings as Record<string, unknown>).homeHeroTitle       as string | null ?? null,
        homeHeroSubtitle:    (settings as Record<string, unknown>).homeHeroSubtitle    as string | null ?? null,
      }
    )
  } catch {
    // Colonnes absentes → sauvegarder uniquement les champs de base
    const settings = await prisma.siteSettings.upsert({
      where:  { id: 'singleton' },
      update: data,
      create: { ...BASE_DEFAULTS, ...data },
    })
    return buildResponse(settings as unknown as Record<string, unknown>, NEW_FIELD_DEFAULTS)
  }
}
