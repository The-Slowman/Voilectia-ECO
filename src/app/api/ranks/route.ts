import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET() {
  const ranks = await prisma.rank.findMany({
    orderBy: { level: 'desc' },
    include: { _count: { select: { users: true } } },
  })
  return NextResponse.json({ ranks })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const r = await prisma.rank.create({ data })
  return NextResponse.json(r, { status: 201 })
}
