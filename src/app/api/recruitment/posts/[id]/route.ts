import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'

function requireAdmin(session: Awaited<ReturnType<typeof auth>>) {
  return session?.user && hasRole((session.user as { role?: string }).role ?? '', 'ADMIN')
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!requireAdmin(session)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const payload: Record<string, unknown> = { ...data }
  if (data.requirements) payload.requirements = JSON.stringify(data.requirements)
  if (data.perks)        payload.perks        = JSON.stringify(data.perks)

  const post = await prisma.recruitmentPost.update({ where: { id: params.id }, data: payload })
  return NextResponse.json(post)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!requireAdmin(session)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.recruitmentPost.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
