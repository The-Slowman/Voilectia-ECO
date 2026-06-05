import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { voteId: string } }) {
  const { option, voterToken } = await req.json()

  if (!option || !voterToken) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  // Vérifier que le vote existe et est ouvert
  const vote = await prisma.cityVote.findUnique({ where: { id: params.voteId } })
  if (!vote || !vote.published) {
    return NextResponse.json({ error: 'Vote introuvable' }, { status: 404 })
  }
  if (vote.endDate && new Date(vote.endDate) < new Date()) {
    return NextResponse.json({ error: 'Vote terminé' }, { status: 400 })
  }

  // Vérifier que l'option est valide
  const options = JSON.parse(vote.options) as string[]
  if (!options.includes(option)) {
    return NextResponse.json({ error: 'Option invalide' }, { status: 400 })
  }

  // Vérifier déjà voté
  const existing = await prisma.cityVoteResponse.findUnique({
    where: { voteId_voterToken: { voteId: params.voteId, voterToken } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Déjà voté' }, { status: 409 })
  }

  const response = await prisma.cityVoteResponse.create({
    data: { voteId: params.voteId, option, voterToken },
  })
  return NextResponse.json(response, { status: 201 })
}
