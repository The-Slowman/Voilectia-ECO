import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET() {
  const [ranks, playerRanks] = await Promise.all([
    prisma.rank.findMany({ orderBy: { level: 'desc' }, include: { _count: { select: { users: true } } } }),
    prisma.playerRank.findMany({ orderBy: { order: 'asc' }, include: { _count: { select: { users: true } } } }),
  ])
  return NextResponse.json({ ranks, playerRanks })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { type, ...data } = await req.json()

  if (type === 'player') {
    const r = await prisma.playerRank.create({ data })
    return NextResponse.json(r, { status: 201 })
  }
  const r = await prisma.rank.create({ data })
  return NextResponse.json(r, { status: 201 })
}
