import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const t = await prisma.tutorial.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
  })
  if (!t) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  await prisma.tutorial.update({ where: { id: t.id }, data: { views: { increment: 1 } } })
  return NextResponse.json(t)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const t = await prisma.tutorial.update({ where: { id: params.id }, data })
  return NextResponse.json(t)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(_req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.tutorial.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
