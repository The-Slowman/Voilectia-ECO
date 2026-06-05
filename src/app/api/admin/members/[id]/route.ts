import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'

// PATCH — modifier un membre (métier, rang, ban, etc.)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || !hasRole(session.user.role, 'ADMIN'))
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { jobId, playerRankId, banned, ecoName, discordTag } = await req.json()

  const updated = await prisma.user.update({
    where: { id: params.id, role: 'PLAYER' },
    data: {
      ...(jobId        !== undefined && { jobId:        jobId        || null }),
      ...(playerRankId !== undefined && { playerRankId: playerRankId || null }),
      ...(banned       !== undefined && { banned, ...(banned ? { playerToken: null } : {}) }),
      ...(ecoName      !== undefined && { ecoName }),
      ...(discordTag   !== undefined && { discordTag }),
    },
    include: { job: true, playerRank: true },
  })

  return NextResponse.json(updated)
}

// DELETE — supprimer un compte joueur
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || !hasRole(session.user.role, 'SUPER_ADMIN'))
    return NextResponse.json({ error: 'Réservé au Super Admin.' }, { status: 403 })

  await prisma.user.delete({ where: { id: params.id, role: 'PLAYER' } })
  return NextResponse.json({ ok: true })
}
