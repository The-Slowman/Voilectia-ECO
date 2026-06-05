import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const adminView = searchParams.get('admin') === '1'

  const session = adminView ? await auth() : null
  const isAdmin = session?.user && hasRole((session.user as { role?: string }).role ?? '', 'ADMIN')

  const surveys = await prisma.survey.findMany({
    where:   adminView && isAdmin ? undefined : { published: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: {
      _count:    { select: { questions: true } },
      questions: {
        orderBy: { order: 'asc' },
        include: { _count: { select: { answers: true } } },
      },
    },
  })
  return NextResponse.json(surveys)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !hasRole((session.user as { role?: string }).role ?? '', 'ADMIN')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { title, description, season, coverImage, endDate, published, order } = await req.json()

  const survey = await prisma.survey.create({
    data: {
      title,
      description: description || null,
      season:      season || null,
      coverImage:  coverImage || null,
      endDate:     endDate ? new Date(endDate) : null,
      published:   !!published,
      order:       order ?? 0,
    },
  })
  return NextResponse.json(survey, { status: 201 })
}
