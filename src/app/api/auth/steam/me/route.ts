/**
 * Retourne le profil Steam du joueur connecté (via cookie).
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('voilectia_steam_session')?.value
  if (!token) return NextResponse.json(null)

  const profile = await prisma.steamProfile.findUnique({
    where:   { sessionToken: token },
    include: { playerRank: true },
  })

  if (!profile) {
    const res = NextResponse.json(null)
    res.cookies.delete('voilectia_steam_session')
    return res
  }

  return NextResponse.json({
    steamId:    profile.steamId,
    username:   profile.username,
    avatar:     profile.avatar,
    profileUrl: profile.profileUrl,
    playerRank: profile.playerRank,
  })
}
