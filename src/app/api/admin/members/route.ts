import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const page   = parseInt(searchParams.get('page') ?? '1')
  const limit  = 20

  const where = search ? {
    role: 'PLAYER' as const,
    OR: [
      { name:       { contains: search } },
      { email:      { contains: search } },
      { ecoName:    { contains: search } },
      { discordTag: { contains: search } },
    ],
  } : { role: 'PLAYER' as const }

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, avatar: true,
        ecoName: true, discordTag: true, createdAt: true, lastLoginAt: true,
        banned: true,
        job:        { select: { name: true, icon: true, color: true } },
        playerRank: { select: { name: true, color: true, badge: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ members, total, pages: Math.ceil(total / limit) })
}
