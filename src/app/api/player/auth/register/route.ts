import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { generatePlayerToken, COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/player-auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, email, password, ecoName, discordTag } = body

    if (!username || !email || !password || !ecoName) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit faire au moins 6 caractères.' }, { status: 400 })
    }

    // Vérifier unicité email
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const playerToken = generatePlayerToken()

    const user = await prisma.user.create({
      data: {
        name: username,
        email,
        password: hashedPassword,
        role: 'PLAYER',
        ecoName,
        discordTag: discordTag || null,
        playerToken,
        lastLoginAt: new Date(),
      },
    })

    const res = NextResponse.json({
      id: user.id,
      username: user.name,
      email: user.email,
      ecoName: user.ecoName,
      discordTag: user.discordTag,
    })

    res.cookies.set(COOKIE_NAME, playerToken, COOKIE_OPTIONS)
    return res
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
