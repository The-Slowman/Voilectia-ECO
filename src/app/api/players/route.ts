import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPlayerFromRequest } from '@/lib/player-auth'

// GET /api/players?search=xxx — recherche joueurs pour messagerie
export async function GET(req: NextRequest) {
  const player = await getPlayerFromRequest(req)
  if (!player) return NextResponse.json([], { status: 200 })

  const search = new URL(req.url).searchParams.get('search') ?? ''

  const players = await prisma.user.findMany({
    where: {
      role: 'PLAYER',
      id:   { not: player.id },
      ...(search ? {
        OR: [
          { name:       { contains: search } },
          { ecoName:    { contains: search } },
          { discordTag: { contains: search } },
        ],
      } : {}),
    },
    select: {
      id:         true,
      name:       true,
      avatar:     true,
      ecoName:    true,
      discordTag: true,
      job:        { select: { name: true, icon: true, color: true } },
      playerRank: { select: { name: true, color: true, badge: true } },
    },
    take: 20,
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(players)
}
