import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !hasRole(session.user.role, 'ADMIN'))
    return NextResponse.json({ error: 'Non autorise.' }, { status: 401 })

  const days     = parseInt(new URL(req.url).searchParams.get('days') ?? '30')
  const cutoff   = new Date(Date.now() - days * 86400000)

  const members = await prisma.user.findMany({
    where: {
      role: 'PLAYER',
      OR: [
        { lastLoginAt: { lt: cutoff } },
        { lastLoginAt: null, createdAt: { lt: cutoff } },
      ],
    },
    select: {
      id: true, name: true, email: true, role: true,
      ecoName: true, createdAt: true, lastLoginAt: true, banned: true,
    },
    orderBy: { lastLoginAt: 'asc' },
  })

  return NextResponse.json({ members, total: members.length })
}
