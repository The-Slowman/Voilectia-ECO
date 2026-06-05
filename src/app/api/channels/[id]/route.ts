import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'

async function checkAdmin() {
  const session = await auth() as { user?: { role?: string } } | null
  return session?.user && hasRole(session.user.role ?? '', 'ADMIN')
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  const data = await req.json()
  const channel = await prisma.channel.update({ where: { id: params.id }, data })
  return NextResponse.json(channel)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  await prisma.channel.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
