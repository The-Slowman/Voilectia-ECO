import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const announcements = await prisma.cityAnnouncement.findMany({
    where:   { cityId: params.id },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: { comments: { orderBy: { createdAt: 'asc' } } },
  })
  return NextResponse.json(announcements)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { title, content, authorName, pinned } = await req.json()
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Titre et contenu requis' }, { status: 400 })
  }

  const ann = await prisma.cityAnnouncement.create({
    data: {
      cityId:     params.id,
      title:      title.trim(),
      content:    content.trim(),
      authorName: authorName?.trim() || 'Admin',
      pinned:     !!pinned,
    },
  })
  return NextResponse.json(ann, { status: 201 })
}
