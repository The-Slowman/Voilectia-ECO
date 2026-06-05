import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const tok = req.cookies.get('voilectia_admin_session')?.value
  if (tok) await prisma.user.updateMany({ where: { playerToken: tok }, data: { playerToken: null } })
  const res = NextResponse.json({ ok: true })
  res.cookies.set('voilectia_admin_session', '', { maxAge: 0, path: '/' })
  return res
}
