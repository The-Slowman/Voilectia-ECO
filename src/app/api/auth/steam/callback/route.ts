import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  verifySteamCallback,
  extractSteamId,
  fetchSteamProfile,
  generateSteamSessionToken,
} from '@/lib/steam'
import { isValidSteamId } from '@/lib/sanitize'

const COOKIE_NAME = 'voilectia_steam_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 jours

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${req.headers.get('host')}`

  // 1. Vérifier que Steam est bien la source (claimed_id valide)
  const claimedId = searchParams.get('openid.claimed_id') ?? ''
  const steamId   = extractSteamId(claimedId)

  if (!steamId || !isValidSteamId(steamId)) {
    return NextResponse.redirect(`${origin}/?steam_error=invalid_id`)
  }

  // 2. Vérifier la signature OpenID auprès de Steam
  const isValid = await verifySteamCallback(searchParams)
  if (!isValid) {
    return NextResponse.redirect(`${origin}/?steam_error=invalid_signature`)
  }

  // 3. Récupérer le profil Steam
  const profile = await fetchSteamProfile(steamId)
  if (!profile) {
    return NextResponse.redirect(`${origin}/?steam_error=profile_fetch_failed`)
  }

  // 4. Créer ou mettre à jour le SteamProfile en base
  const sessionToken = generateSteamSessionToken()

  await prisma.steamProfile.upsert({
    where:  { steamId },
    update: {
      username:     profile.username,
      avatar:       profile.avatar,
      profileUrl:   profile.profileUrl,
      sessionToken,
      lastLoginAt:  new Date(),
    },
    create: {
      steamId,
      username:     profile.username,
      avatar:       profile.avatar,
      profileUrl:   profile.profileUrl,
      sessionToken,
      lastLoginAt:  new Date(),
    },
  })

  // 5. Définir le cookie de session Steam
  const isHttps = origin.startsWith('https://')
  const response = NextResponse.redirect(`${origin}/profil`)
  response.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure:   isHttps,
    sameSite: 'lax',
    maxAge:   COOKIE_MAX_AGE,
    path:     '/',
  })

  return response
}
