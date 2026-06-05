import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { slugify } from '@/lib/utils'

const schema = z.object({
  title:       z.string().min(5).max(150),
  categoryId:  z.string().min(1),
  authorName:  z.string().min(2).max(60),
  authorEmail: z.string().email().optional().or(z.literal('')),
  content:     z.string().min(20),
  excerpt:     z.string().max(300).optional(),
})

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search   = searchParams.get('q')?.trim()
  const sort     = searchParams.get('sort') ?? 'recent'   // recent | popular | views
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit    = Math.min(50, parseInt(searchParams.get('limit') ?? String(PAGE_SIZE)))
  const adminAll = searchParams.get('admin') === '1'

  const where = {
    ...(adminAll ? {} : { approved: true }),
    ...(category ? { category: { slug: category } } : {}),
    ...(search ? {
      OR: [
        { title:      { contains: search } },
        { authorName: { contains: search } },
        { excerpt:    { contains: search } },
      ],
    } : {}),
  }

  const orderBy =
    sort === 'popular' ? [{ pinned: 'desc' as const }, { comments: { _count: 'desc' as const } }]
    : sort === 'views' ? [{ pinned: 'desc' as const }, { views: 'desc' as const }]
    :                    [{ pinned: 'desc' as const }, { createdAt: 'desc' as const }]

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where,
      orderBy,
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        category: { select: { name: true, slug: true, color: true, icon: true } },
        _count:   { select: { comments: { where: { approved: true } }, reactions: true } },
      },
    }),
    prisma.forumPost.count({ where }),
  ])

  return NextResponse.json({
    posts,
    total,
    page,
    pages: Math.ceil(total / limit),
    pageSize: limit,
  })
}

export async function POST(req: NextRequest) {
  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { title, categoryId, authorName, authorEmail, content, excerpt } = parsed.data

  let slug = slugify(title)
  const existing = await prisma.forumPost.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  const post = await prisma.forumPost.create({
    data: {
      title, slug, content,
      excerpt:     excerpt || null,
      authorName,
      authorEmail: authorEmail || null,
      categoryId,
      approved:    false,
    },
  })

  return NextResponse.json(post, { status: 201 })
}
