import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { voteId: string } }) {
  const vote = await prisma.cityVote.findUnique({
    where:   { id: params.voteId },
    include: { responses: true, city: { select: { name: true, slug: true, accentColor: true } } },
  })
  if (!vote) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json({ ...vote, options: JSON.parse(vote.options) as string[] })
}
