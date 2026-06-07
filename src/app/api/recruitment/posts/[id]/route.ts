import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const payload: Record<string, unknown> = { ...data }
  if (data.requirements) payload.requirements = JSON.stringify(data.requirements)
  if (data.perks)        payload.perks        = JSON.stringify(data.perks)

  const post = await prisma.recruitmentPost.update({ where: { id: params.id }, data: payload })
  return NextResponse.json(post)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.recruitmentPost.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
