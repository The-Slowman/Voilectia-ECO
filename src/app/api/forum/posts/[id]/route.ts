import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

// GET by id or slug (public)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.forumPost.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }], approved: true },
    include: {
      category: { select: { name: true, slug: true, color: true, icon: true } },
      comments: {
        where:   { approved: true },
        orderBy: { createdAt: 'asc' },
        include: { _count: { select: { reactions: true } } },
      },
      _count: { select: { reactions: true } },
    },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.forumPost.update({
    where: { id: post.id },
    data:  { views: { increment: 1 } },
  })

  return NextResponse.json(post)
}

// PATCH — admin : pin, close, approve, move category, edit title/content
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()

  // Seuls les champs autorisés
  const allowed: Record<string, unknown> = {}
  const fields = ['pinned','closed','approved','title','content','excerpt','categoryId'] as const
  for (const f of fields) {
    if (f in data) allowed[f] = data[f]
  }

  const post = await prisma.forumPost.update({
    where:   { id: params.id },
    data:    allowed,
    include: { category: { select: { name: true, slug: true, color: true } } },
  })
  return NextResponse.json(post)
}

// DELETE — admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.forumPost.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
