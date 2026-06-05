import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPlayerFromRequest } from '@/lib/player-auth'

// GET — liste des conversations (dernier message + nb non lus)
export async function GET(req: NextRequest) {
  const player = await getPlayerFromRequest(req)
  if (!player) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })

  // Récupère tous les partenaires de conversation
  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [{ senderId: player.id }, { receiverId: player.id }],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sender:   { select: { id: true, name: true, avatar: true, ecoName: true } },
      receiver: { select: { id: true, name: true, avatar: true, ecoName: true } },
    },
  })

  // Déduplique par partenaire, garde le dernier message
  const seen = new Set<string>()
  const conversations: typeof messages = []
  for (const msg of messages) {
    const partnerId = msg.senderId === player.id ? msg.receiverId : msg.senderId
    if (!seen.has(partnerId)) {
      seen.add(partnerId)
      conversations.push(msg)
    }
  }

  // Compte les non-lus par partenaire
  const unreadCounts = await prisma.directMessage.groupBy({
    by:     ['senderId'],
    where:  { receiverId: player.id, read: false },
    _count: { _all: true },
  })
  const unreadMap = Object.fromEntries(unreadCounts.map(u => [u.senderId, u._count._all]))

  return NextResponse.json(
    conversations.map(msg => {
      const partner = msg.senderId === player.id ? msg.receiver : msg.sender
      return {
        partner,
        lastMessage: { content: msg.content, createdAt: msg.createdAt, fromMe: msg.senderId === player.id },
        unread: unreadMap[partner.id] ?? 0,
      }
    })
  )
}

// POST — envoyer un message privé
export async function POST(req: NextRequest) {
  const player = await getPlayerFromRequest(req)
  if (!player) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })

  const { receiverId, content } = await req.json()
  if (!receiverId || !content?.trim()) {
    return NextResponse.json({ error: 'Destinataire et message requis.' }, { status: 400 })
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId, role: 'PLAYER' } })
  if (!receiver) return NextResponse.json({ error: 'Joueur introuvable.' }, { status: 404 })

  const msg = await prisma.directMessage.create({
    data: { senderId: player.id, receiverId, content: content.trim() },
    include: {
      sender:   { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
    },
  })

  return NextResponse.json(msg, { status: 201 })
}
