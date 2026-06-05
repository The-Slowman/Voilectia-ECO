import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { slugify } from '@/lib/utils'

const schema = z.object({
  title:      z.string().min(1),
  slug:       z.string().optional(),
  excerpt:    z.string().optional(),
  content:    z.string().min(1),
  coverImage: z.string().url().optional().or(z.literal('')),
  category:   z.enum(['news', 'announcement', 'update']).default('news'),
  published:  z.boolean().default(false),
  pinned:     z.boolean().default(false),
  metaTitle:  z.string().optional(),
  metaDesc:   z.string().optional(),
})

// GET — liste publique
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit    = parseInt(searchParams.get('limit')    ?? '10')
  const category = searchParams.get('category')
  const pinned   = searchParams.get('pinned')

  const articles = await prisma.article.findMany({
    where: {
      published: true,
      ...(category ? { category } : {}),
      ...(pinned === 'true' ? { pinned: true } : {}),
    },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    take:    limit,
    include: { author: { select: { name: true } } },
  })

  return NextResponse.json(articles)
}

// POST — créer article (admin)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const data = parsed.data
  const slug = data.slug || slugify(data.title)

  // Check slug uniqueness
  const existing = await prisma.article.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'Ce slug est déjà utilisé.' }, { status: 409 })

  const article = await prisma.article.create({
    data: {
      ...data,
      slug,
      coverImage: data.coverImage || null,
      authorId:   (session.user as { id?: string }).id!,
    },
  })

  return NextResponse.json(article, { status: 201 })
}
