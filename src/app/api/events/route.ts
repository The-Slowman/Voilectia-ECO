import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const isAdmin = searchParams.get('admin') === '1'

  const events = await prisma.event.findMany({
    where: isAdmin ? undefined : { published: true },
    orderBy: { startDate: 'asc' },
    include: { author: { select: { name: true } } },
  })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const event = await prisma.event.create({
    data: {
      ...data,
      authorId: admin.id,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  })
  return NextResponse.json(event, { status: 201 })
}
