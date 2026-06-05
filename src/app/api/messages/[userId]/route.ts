import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPlayerFromRequest } from '@/lib/player-auth'

// GET — conversation complète avec un joueur, marque comme lus
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const player = await getPlayerFromRequest(req)
  if (!player) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })

  const { userId } = params

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: player.id, receiverId: userId },
        { senderId: userId,    receiverId: player.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  })

  // Marquer les messages reçus comme lus
  await prisma.directMessage.updateMany({
    where: { senderId: userId, receiverId: player.id, read: false },
    data:  { read: true },
  })

  return NextResponse.json(messages)
}
