import { NextRequest, NextResponse } from 'next/server'
import { getPlayerFromRequest } from '@/lib/player-auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getPlayerFromRequest(req)
    if (!user) {
      return NextResponse.json(null, { status: 200 })
    }
    return NextResponse.json({
      id: user.id,
      username: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      ecoName: user.ecoName,
      discordTag: user.discordTag,
      bio: user.bio,
      job: user.job,
      playerRank: user.playerRank,
      lastLoginAt: user.lastLoginAt,
    })
  } catch (err) {
    console.error('[me]', err)
    return NextResponse.json(null, { status: 200 })
  }
}
