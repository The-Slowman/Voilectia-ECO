import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const categories = await prisma.forumCategory.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { posts: true } } },
  })
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const cat = await prisma.forumCategory.create({ data })
  return NextResponse.json(cat, { status: 201 })
}
