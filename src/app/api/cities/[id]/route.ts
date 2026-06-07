import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const city = await prisma.city.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: {
      images:        { orderBy: { order: 'asc' } },
      memberships:   { where: { status: 'approved' } },
      announcements: { orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }], include: { comments: true } },
      projects:      { orderBy: { createdAt: 'desc' }, include: { participants: true } },
      cityVotes:     { where: { published: true }, orderBy: { createdAt: 'desc' }, include: { responses: true } },
    },
  })
  if (!city) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json(city)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const city = await prisma.city.update({ where: { id: params.id }, data })
  return NextResponse.json(city)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.city.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
