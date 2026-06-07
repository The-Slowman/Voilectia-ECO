import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { logAudit } from '@/lib/audit'

// POST — tirer un gagnant au sort
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const giveaway = await prisma.giveaway.findUnique({
      where: { id: params.id },
      include: { entries: true },
    })
    if (!giveaway) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 })
    if (giveaway.entries.length === 0)
      return NextResponse.json({ error: 'Aucun participant.' }, { status: 400 })

    const winner = giveaway.entries[Math.floor(Math.random() * giveaway.entries.length)]
    const updated = await prisma.giveaway.update({
      where: { id: params.id },
      data: { ended: true, winnerId: winner.id, winnerName: winner.playerName },
    })

    await logAudit({
      userId: admin.id, userName: admin.name,
      action: 'UPDATE', resource: 'giveaway', resourceId: params.id,
      detail: `Gagnant tiré : ${winner.playerName}`, req,
    })

    return NextResponse.json({ winner, giveaway: updated })
  } catch (err) {
    console.error('[giveaway draw]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
