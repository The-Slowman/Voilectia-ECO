import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const isAdmin = searchParams.get('admin') === '1'

  const guides = await prisma.guide.findMany({
    where: isAdmin ? undefined : { published: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { author: { select: { name: true } } },
  })
  return NextResponse.json(guides)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const guide = await prisma.guide.create({
    data: { ...data, authorId: admin.id },
  })
  return NextResponse.json(guide, { status: 201 })
}
