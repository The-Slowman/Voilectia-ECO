import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const {
    postId, playerName, discordTag, email,
    age, experience, motivation, availability, timezone,
  } = await req.json()

  if (!postId || !playerName?.trim() || !discordTag?.trim() || !experience?.trim() || !motivation?.trim()) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  // Vérifier que le poste est ouvert
  const post = await prisma.recruitmentPost.findUnique({ where: { id: postId } })
  if (!post || !post.open) {
    return NextResponse.json({ error: 'Ce poste n\'est plus ouvert' }, { status: 400 })
  }

  // Anti-doublon : un joueur ne peut postuler qu'une fois par poste
  const existing = await prisma.recruitmentApplication.findFirst({
    where: { postId, playerName: playerName.trim() },
  })
  if (existing) {
    return NextResponse.json({ error: 'Vous avez déjà postulé pour ce poste.' }, { status: 409 })
  }

  const application = await prisma.recruitmentApplication.create({
    data: {
      postId,
      playerName:   playerName.trim(),
      discordTag:   discordTag.trim(),
      email:        email?.trim() || null,
      age:          age ? parseInt(age) : null,
      experience:   experience.trim(),
      motivation:   motivation.trim(),
      availability: availability?.trim() || null,
      timezone:     timezone?.trim() || null,
    },
  })

  return NextResponse.json(application, { status: 201 })
}
