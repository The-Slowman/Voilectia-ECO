import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  const data = await req.json()
  const channel = await prisma.channel.update({ where: { id: params.id }, data })
  return NextResponse.json(channel)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  await prisma.channel.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
