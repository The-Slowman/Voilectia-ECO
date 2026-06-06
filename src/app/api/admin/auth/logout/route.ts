import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const tok = req.cookies.get('voilectia_admin_session')?.value
  if (tok) {
    const user = await prisma.user.findFirst({ where: { adminToken: tok }, select: { id: true, name: true } })
    // Invalider le adminToken
    await prisma.user.updateMany({ where: { adminToken: tok }, data: { adminToken: null } })
    if (user) {
      await logAudit({ userId: user.id, userName: user.name, action: 'LOGOUT', resource: 'admin', req })
    }
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('voilectia_admin_session', '', { maxAge: 0, path: '/' })
  return res
}
