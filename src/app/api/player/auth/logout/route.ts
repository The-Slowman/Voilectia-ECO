import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { COOKIE_NAME } from '@/lib/player-auth'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (token) {
      await prisma.user.updateMany({
        where: { playerToken: token },
        data: { playerToken: null },
      })
    }
    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
    return res
  } catch (err) {
    console.error('[logout]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
