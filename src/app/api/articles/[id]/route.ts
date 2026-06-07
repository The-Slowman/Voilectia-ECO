import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { z } from 'zod'

const patchSchema = z.object({
  title:      z.string().min(1).optional(),
  slug:       z.string().optional(),
  excerpt:    z.string().optional(),
  content:    z.string().optional(),
  coverImage: z.string().optional(),
  category:   z.enum(['news', 'announcement', 'update']).optional(),
  published:  z.boolean().optional(),
  pinned:     z.boolean().optional(),
  metaTitle:  z.string().optional(),
  metaDesc:   z.string().optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where:   { id: params.id },
    include: { author: { select: { name: true } } },
  })
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(article)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body   = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const article = await prisma.article.update({
    where: { id: params.id },
    data:  parsed.data,
  })

  return NextResponse.json(article)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.article.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
