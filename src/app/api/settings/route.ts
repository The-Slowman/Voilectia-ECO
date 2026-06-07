import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

// Paramètres par défaut si la table est vide
const DEFAULTS = {
  id:                  'singleton',
  maintenanceActive:   false,
  maintenanceTitle:    'Saison 2 — Bientôt disponible',
  maintenanceMessage:  'Le serveur se prépare pour une nouvelle aventure. Restez connectés !',
  launchDate:          null,
  allowedSections:     JSON.stringify(['forum', 'tutoriels', 'top-serveur']),
  ecoMapEnabled:       false,
  ecoMapUrl:           '',
  ecoMapTitle:         'Carte du monde',
  siteDiscordUrl:      process.env.NEXT_PUBLIC_DISCORD_URL ?? 'https://discord.gg/voilectia',
  siteServerIp:        '',
  updatedBy:           null,
  announcementEnabled: false,
  announcementText:    null,
  homeHeroTitle:       null,
  homeHeroSubtitle:    null,
}

// GET — public (pour le middleware et la page maintenance)
export async function GET() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })

  if (!settings) {
    // Créer les paramètres par défaut au premier appel
    settings = await prisma.siteSettings.create({ data: DEFAULTS })
  }

  return NextResponse.json({
    ...settings,
    allowedSections: JSON.parse(settings.allowedSections) as string[],
  })
}

// PATCH — Fondateur (SUPER_ADMIN) uniquement
export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromRequest(req, 'SUPER_ADMIN')
  if (!admin) {
    return NextResponse.json({ error: 'Réservé aux fondateurs' }, { status: 403 })
  }

  const body = await req.json()
  const data: Record<string, unknown> = {}

  // Champs autorisés
  if ('maintenanceActive'  in body) data.maintenanceActive  = body.maintenanceActive
  if ('maintenanceTitle'   in body) data.maintenanceTitle   = body.maintenanceTitle
  if ('maintenanceMessage' in body) data.maintenanceMessage = body.maintenanceMessage
  if ('launchDate'         in body) data.launchDate = body.launchDate ? new Date(body.launchDate) : null
  if ('allowedSections'    in body) data.allowedSections = JSON.stringify(body.allowedSections)
  if ('siteDiscordUrl'      in body) data.siteDiscordUrl      = body.siteDiscordUrl
  if ('siteServerIp'        in body) data.siteServerIp        = body.siteServerIp
  if ('announcementEnabled' in body) data.announcementEnabled = body.announcementEnabled
  if ('announcementText'    in body) data.announcementText    = body.announcementText || null
  if ('homeHeroTitle'       in body) data.homeHeroTitle       = body.homeHeroTitle    || null
  if ('homeHeroSubtitle'    in body) data.homeHeroSubtitle    = body.homeHeroSubtitle || null

  data.updatedBy = admin.name

  const settings = await prisma.siteSettings.upsert({
    where:  { id: 'singleton' },
    update: data,
    create: { ...DEFAULTS, ...data },
  })

  return NextResponse.json({
    ...settings,
    allowedSections: JSON.parse(settings.allowedSections) as string[],
  })
}
