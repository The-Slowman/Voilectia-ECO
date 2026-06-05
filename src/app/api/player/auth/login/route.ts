import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { generatePlayerToken, COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/player-auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { job: true, playerRank: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Identifiants invalides.' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 })
    }

    const playerToken = generatePlayerToken()

    await prisma.user.update({
      where: { id: user.id },
      data: { playerToken, lastLoginAt: new Date() },
    })

    const res = NextResponse.json({
      id: user.id,
      username: user.name,
      email: user.email,
      avatar: user.avatar,
      ecoName: user.ecoName,
      discordTag: user.discordTag,
      bio: user.bio,
      job: user.job,
      playerRank: user.playerRank,
    })

    res.cookies.set(COOKIE_NAME, playerToken, COOKIE_OPTIONS)
    return res
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
