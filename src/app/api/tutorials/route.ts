import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const adminView = searchParams.get('admin') === '1'
  const category  = searchParams.get('category')

  const session = adminView ? await auth() : null
  const isAdmin = !!session?.user

  const tutorials = await prisma.tutorial.findMany({
    where: {
      ...(!isAdmin && { published: true }),
      ...(category && { category }),
    },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(tutorials)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const t = await prisma.tutorial.create({
    data: {
      ...data,
      slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    },
  })
  return NextResponse.json(t, { status: 201 })
}
