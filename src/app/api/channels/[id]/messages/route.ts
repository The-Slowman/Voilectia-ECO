import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPlayerFromRequest } from '@/lib/player-auth'

// GET — messages du canal (50 derniers, ou avant cursor)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const cursor = new URL(req.url).searchParams.get('cursor')

  const messages = await prisma.channelMessage.findMany({
    where:   { channelId: params.id },
    orderBy: { createdAt: 'desc' },
    take:    50,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: { select: { id: true, name: true, avatar: true, ecoName: true,
                          job: { select: { name: true, icon: true } },
                          playerRank: { select: { name: true, color: true, badge: true } } } },
    },
  })

  return NextResponse.json(messages.reverse())
}

// POST — envoyer un message dans le canal
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const player = await getPlayerFromRequest(req)
  if (!player) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Message vide.' }, { status: 400 })

  const channel = await prisma.channel.findUnique({ where: { id: params.id } })
  if (!channel) return NextResponse.json({ error: 'Canal introuvable.' }, { status: 404 })

  const msg = await prisma.channelMessage.create({
    data: { channelId: params.id, authorId: player.id, content: content.trim() },
    include: {
      author: { select: { id: true, name: true, avatar: true, ecoName: true,
                          job: { select: { name: true, icon: true } },
                          playerRank: { select: { name: true, color: true, badge: true } } } },
    },
  })

  return NextResponse.json(msg, { status: 201 })
}
