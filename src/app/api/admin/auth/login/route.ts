import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { ADMIN_COOKIE, ADMIN_COOKIE_OPTIONS, createAdminSession } from '@/lib/admin-auth'

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

    // Crée une session hashée en base ; le cookie ne contient que le token brut.
    const ip =
      req.headers.get('x-real-ip') ??
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      null
    const userAgent = req.headers.get('user-agent')

    const token = await createAdminSession(user.id, { ip, userAgent })

    await prisma.user.update({
      where: { id: user.id },
      data:  { lastLoginAt: new Date() },
    })

    await logAudit({
      userId:   user.id,
      userName: user.name,
      action:   'LOGIN',
      resource: 'admin',
      req,
    })

    const res = NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role })
    res.cookies.set(ADMIN_COOKIE, token, ADMIN_COOKIE_OPTIONS)
    return res
  } catch (e) {
    console.error('[admin-login]', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
