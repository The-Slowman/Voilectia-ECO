import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'
import { parseBody, giveawaySchema } from '@/lib/validate'
import { logAudit } from '@/lib/audit'

const patchSchema = giveawaySchema.partial().extend({
  ended:      z.boolean().optional(),
  winnerName: z.string().optional().nullable(),
})

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const g = await prisma.giveaway.findUnique({
      where: { id: params.id },
      include: { _count: { select: { entries: true } }, entries: { orderBy: { createdAt: 'asc' } } },
    })
    if (!g) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 })
    return NextResponse.json(g)
  } catch (err) {
    console.error('[giveaway GET]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || !hasRole(session.user.role, 'ADMIN'))
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { data, error } = await parseBody(req, patchSchema)
  if (error) return error

  try {
    const g = await prisma.giveaway.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
      },
    })
    await logAudit({ userId: session.user.id, userName: session.user.name, action: 'UPDATE', resource: 'giveaway', resourceId: g.id, req })
    return NextResponse.json(g)
  } catch (err) {
    console.error('[giveaway PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || !hasRole(session.user.role, 'SUPER_ADMIN'))
    return NextResponse.json({ error: 'Réservé au Super Admin.' }, { status: 403 })

  try {
    await prisma.giveaway.delete({ where: { id: params.id } })
    await logAudit({ userId: session.user.id, userName: session.user.name, action: 'DELETE', resource: 'giveaway', resourceId: params.id })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[giveaway DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
