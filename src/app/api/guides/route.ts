import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const adminView = searchParams.get('admin') === '1'
  const session = adminView ? await auth() : null
  const isAdmin = !!session?.user

  const guides = await prisma.guide.findMany({
    where: isAdmin ? undefined : { published: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { author: { select: { name: true } } },
  })
  return NextResponse.json(guides)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const guide = await prisma.guide.create({
    data: { ...data, authorId: (session.user as { id: string }).id },
  })
  return NextResponse.json(guide, { status: 201 })
}
