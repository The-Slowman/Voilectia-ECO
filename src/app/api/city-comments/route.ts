import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPlayerFromRequest } from '@/lib/player-auth'

export async function POST(req: NextRequest) {
  const user = await getPlayerFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { announcementId, content } = await req.json()

  if (!announcementId || !content?.trim()) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const comment = await prisma.cityComment.create({
    data: {
      announcementId,
      authorName: user.name,
      content:    content.trim(),
    },
  })

  return NextResponse.json(comment, { status: 201 })
}
