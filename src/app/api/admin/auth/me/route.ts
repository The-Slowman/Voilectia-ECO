import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const tok = req.cookies.get('voilectia_admin_session')?.value
  if (!tok) return NextResponse.json(null)

  // Utilise adminToken uniquement
  const user = await prisma.user.findFirst({
    where:   { adminToken: tok, role: { not: 'PLAYER' } },
    include: { rank: true },
  })
  if (!user) return NextResponse.json(null)

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, rank: user.rank })
}
