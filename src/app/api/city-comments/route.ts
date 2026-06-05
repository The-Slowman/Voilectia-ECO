import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { announcementId, authorName, content } = await req.json()

  if (!announcementId || !authorName?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const comment = await prisma.cityComment.create({
    data: {
      announcementId,
      authorName: authorName.trim(),
      content:    content.trim(),
    },
  })

  return NextResponse.json(comment, { status: 201 })
}
