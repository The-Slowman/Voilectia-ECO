import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPlayerFromRequest } from '@/lib/player-auth'

export async function PATCH(req: NextRequest) {
  try {
    const player = await getPlayerFromRequest(req)
    if (!player) return NextResponse.json({ error: 'Non connecté.' }, { status: 401 })

    const { discordTag, ecoName, bio, jobId, avatar } = await req.json()

    // Vérifier que le job existe si fourni
    if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId } })
      if (!job) return NextResponse.json({ error: 'Métier introuvable.' }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id: player.id },
      data: {
        ...(discordTag !== undefined && { discordTag: discordTag || null }),
        ...(ecoName    !== undefined && { ecoName:    ecoName    || null }),
        ...(bio        !== undefined && { bio:        bio        || null }),
        ...(jobId      !== undefined && { jobId:      jobId      || null }),
        ...(avatar     !== undefined && { avatar:     avatar     || null }),
      },
      include: { job: true, playerRank: true },
    })

    return NextResponse.json({
      id:         updated.id,
      username:   updated.name,
      email:      updated.email,
      avatar:     updated.avatar,
      ecoName:    updated.ecoName,
      discordTag: updated.discordTag,
      bio:        updated.bio,
      job:        updated.job,
      playerRank: updated.playerRank,
    })
  } catch (err) {
    console.error('[update-profile]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
