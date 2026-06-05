import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const adminView = searchParams.get('admin') === '1'
  const session   = adminView ? await auth() : null
  const isAdmin   = !!session?.user

  const [pages, navItems] = await Promise.all([
    prisma.customPage.findMany({
      where:   isAdmin ? undefined : { published: true },
      orderBy: { order: 'asc' },
    }),
    prisma.navItem.findMany({
      where:   isAdmin ? undefined : { active: true },
      orderBy: { order: 'asc' },
    }),
  ])
  return NextResponse.json({ pages, navItems })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { type, ...data } = await req.json()

  if (type === 'navitem') {
    const item = await prisma.navItem.create({ data })
    return NextResponse.json(item, { status: 201 })
  }

  const page = await prisma.customPage.create({ data })
  return NextResponse.json(page, { status: 201 })
}
