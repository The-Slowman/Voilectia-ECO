import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'

// GET public — postes ouverts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const adminView = searchParams.get('admin') === '1'

  const session = adminView ? await auth() : null
  const isAdmin = session?.user && hasRole((session.user as { role?: string }).role ?? '', 'ADMIN')

  const posts = await prisma.recruitmentPost.findMany({
    where:   adminView && isAdmin ? undefined : { open: true },
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { applications: true } },
    },
  })
  return NextResponse.json(posts)
}

// POST admin — créer un poste
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !hasRole((session.user as { role?: string }).role ?? '', 'ADMIN')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const data = await req.json()
  const post = await prisma.recruitmentPost.create({
    data: {
      ...data,
      requirements: JSON.stringify(data.requirements ?? []),
      perks:        JSON.stringify(data.perks ?? []),
    },
  })
  return NextResponse.json(post, { status: 201 })
}
