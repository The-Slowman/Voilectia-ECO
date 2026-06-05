import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'

/** Assigner un rang staff ou in-game à un utilisateur */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !hasRole((session.user as { role?: string }).role ?? '', 'ADMIN')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { type, targetId, rankId } = await req.json()

  if (type === 'staff') {
    // Rang staff (admin)
    await prisma.user.update({
      where: { id: targetId },
      data:  { rankId: rankId || null },
    })
  } else if (type === 'player') {
    // Rang in-game (joueur)
    await prisma.user.update({
      where: { id: targetId, role: 'PLAYER' },
      data:  { playerRankId: rankId || null },
    })
  } else {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
