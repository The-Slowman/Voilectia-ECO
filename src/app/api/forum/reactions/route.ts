import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '🔥', '👎']

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const postId    = searchParams.get('postId')
  const commentId = searchParams.get('commentId')

  if (!postId && !commentId) {
    return NextResponse.json({ error: 'postId ou commentId requis' }, { status: 400 })
  }

  const reactions = await prisma.forumReaction.findMany({
    where: postId ? { postId } : { commentId: commentId! },
  })

  // Grouper par emoji
  const counts: Record<string, number> = {}
  for (const r of reactions) {
    counts[r.emoji] = (counts[r.emoji] ?? 0) + 1
  }

  return NextResponse.json({ counts, total: reactions.length })
}

export async function POST(req: NextRequest) {
  const { postId, commentId, emoji, voterToken } = await req.json()

  if (!emoji || !voterToken || (!postId && !commentId)) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }
  if (!ALLOWED_EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: 'Emoji non autorisé' }, { status: 400 })
  }

  try {
    // Toggle : si la réaction existe déjà, on la supprime (unlike)
    const where = postId
      ? { postId_voterToken_emoji: { postId, voterToken, emoji } }
      : { commentId_voterToken_emoji: { commentId: commentId!, voterToken, emoji } }

    const existing = await prisma.forumReaction.findUnique({ where })

    if (existing) {
      await prisma.forumReaction.delete({ where })
      return NextResponse.json({ action: 'removed' })
    }

    await prisma.forumReaction.create({
      data: { emoji, voterToken, postId: postId ?? null, commentId: commentId ?? null },
    })
    return NextResponse.json({ action: 'added' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
