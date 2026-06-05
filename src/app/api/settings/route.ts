import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// Paramètres par défaut si la table est vide
const DEFAULTS = {
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
  const session = await auth()
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? ''

  if (!session?.user || userRole !== 'SUPER_ADMIN') {
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
  if ('ecoMapEnabled'      in body) data.ecoMapEnabled = body.ecoMapEnabled
  if ('ecoMapUrl'          in body) data.ecoMapUrl = body.ecoMapUrl
  if ('ecoMapTitle'        in body) data.ecoMapTitle = body.ecoMapTitle
  if ('siteDiscordUrl'     in body) data.siteDiscordUrl = body.siteDiscordUrl
  if ('siteServerIp'       in body) data.siteServerIp = body.siteServerIp

  data.updatedBy = (session.user as { name?: string }).name ?? 'Admin'

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
