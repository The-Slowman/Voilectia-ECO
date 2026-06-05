import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  vote:  z.enum(['up', 'down']).nullable(),
  token: z.string().min(1),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const { vote, token } = parsed.data
  const suggestionId    = params.id

  // Vote existant ?
  const existing = await prisma.suggestionVote.findUnique({
    where: { suggestionId_voterToken: { suggestionId, voterToken: token } },
  })

  await prisma.$transaction(async (tx) => {
    if (existing) {
      // Supprimer l'ancien vote
      await tx.suggestionVote.delete({
        where: { suggestionId_voterToken: { suggestionId, voterToken: token } },
      })
      // Décrémenter le compteur
      if (existing.vote === 'up') {
        await tx.suggestion.update({ where: { id: suggestionId }, data: { upvotes: { decrement: 1 } } })
      } else {
        await tx.suggestion.update({ where: { id: suggestionId }, data: { downvotes: { decrement: 1 } } })
      }
    }

    if (vote) {
      // Nouveau vote
      await tx.suggestionVote.create({ data: { suggestionId, voterToken: token, vote } })
      if (vote === 'up') {
        await tx.suggestion.update({ where: { id: suggestionId }, data: { upvotes: { increment: 1 } } })
      } else {
        await tx.suggestion.update({ where: { id: suggestionId }, data: { downvotes: { increment: 1 } } })
      }
    }
  })

  const updated = await prisma.suggestion.findUnique({ where: { id: suggestionId } })
  return NextResponse.json(updated)
}
