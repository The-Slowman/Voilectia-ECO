import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const cities = await prisma.city.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: {
          memberships:   { where: { status: 'approved' } },
          projects:      true,
          announcements: true,
        },
      },
    },
  })
  return NextResponse.json(cities)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const city = await prisma.city.create({ data })
  return NextResponse.json(city, { status: 201 })
}
