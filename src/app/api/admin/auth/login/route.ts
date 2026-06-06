import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'

const COOKIE = 'voilectia_admin_session'
const OPTS   = {
  httpOnly: true,
  secure:   process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https') ?? false,
  sameSite: 'lax' as const,
  maxAge:   60 * 60 * 24 * 7, // 7 jours
  path:     '/',
}

function generateToken() {
  const a = new Uint8Array(32)
  crypto.getRandomValues(a)
  return Array.from(a, b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password)
      return NextResponse.json({ error: 'Champs requis.' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email }, include: { rank: true } })

    // Bloquer les joueurs et les comptes bannis
    if (!user || user.role === 'PLAYER' || user.banned)
      return NextResponse.json({ error: 'Identifiants invalides.' }, { status: 401 })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok)
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 })

    // Utilise adminToken — jamais playerToken
    const tok = generateToken()
    await prisma.user.update({
      where: { id: user.id },
      data: { adminToken: tok, lastLoginAt: new Date() },
    })

    await logAudit({
      userId:   user.id,
      userName: user.name,
      action:   'LOGIN',
      resource: 'admin',
      req,
    })

    const res = NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role })
    res.cookies.set(COOKIE, tok, OPTS)
    return res
  } catch (e) {
    console.error('[admin-login]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
