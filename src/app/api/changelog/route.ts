import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  version:   z.string().min(1),
  title:     z.string().min(1),
  content:   z.string().min(1),
  season:    z.string().default('S1'),
  type:      z.enum(['major', 'update', 'hotfix', 'content']).default('update'),
  published: z.boolean().default(false),
  publishedAt: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const season = searchParams.get('season')

  const changelogs = await prisma.changelog.findMany({
    where: { published: true, ...(season ? { season } : {}) },
    orderBy: { publishedAt: 'desc' },
    take: 50,
    include: { author: { select: { name: true } } },
  })
  return NextResponse.json(changelogs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { publishedAt, ...data } = parsed.data

  const entry = await prisma.changelog.create({
    data: {
      ...data,
      publishedAt: publishedAt ? new Date(publishedAt) : data.published ? new Date() : null,
      authorId:    (session.user as { id?: string }).id!,
    },
  })

  return NextResponse.json(entry, { status: 201 })
}
