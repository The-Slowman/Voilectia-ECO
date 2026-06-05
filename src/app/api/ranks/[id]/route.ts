import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'

function requireAdmin(session: { user?: { role?: string } } | null) {
  return session?.user && hasRole((session.user as { role?: string }).role ?? '', 'ADMIN')
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!requireAdmin(session)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { type, ...data } = await req.json()

  if (type === 'player') {
    const r = await prisma.playerRank.update({ where: { id: params.id }, data })
    return NextResponse.json(r)
  }
  const r = await prisma.rank.update({ where: { id: params.id }, data })
  return NextResponse.json(r)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!requireAdmin(session)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  if (type === 'player') {
    await prisma.playerRank.delete({ where: { id: params.id } })
  } else {
    await prisma.rank.delete({ where: { id: params.id } })
  }
  return NextResponse.json({ success: true })
}
