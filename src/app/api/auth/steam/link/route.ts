/**
 * Lie un compte Steam à un compte admin existant.
 * L'admin doit être connecté et le joueur Steam doit avoir un cookie valide.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  // Vérifier session admin
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Vérifier le cookie Steam
  const steamToken = req.cookies.get('voilectia_steam_session')?.value
  if (!steamToken) {
    return NextResponse.json({ error: 'Aucune session Steam active. Connectez-vous via Steam d\'abord.' }, { status: 400 })
  }

  const steamProfile = await prisma.steamProfile.findUnique({
    where: { sessionToken: steamToken },
  })
  if (!steamProfile) {
    return NextResponse.json({ error: 'Session Steam invalide ou expirée.' }, { status: 400 })
  }

  // Vérifier que ce Steam ID n'est pas déjà lié à un autre compte
  if (steamProfile.userId && steamProfile.userId !== (session.user as { id?: string }).id) {
    return NextResponse.json({ error: 'Ce compte Steam est déjà lié à un autre compte admin.' }, { status: 409 })
  }

  const userId = (session.user as { id?: string }).id!

  await prisma.steamProfile.update({
    where: { steamId: steamProfile.steamId },
    data:  { userId },
  })

  return NextResponse.json({ success: true, steamId: steamProfile.steamId })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const userId = (session.user as { id?: string }).id!

  await prisma.steamProfile.updateMany({
    where: { userId },
    data:  { userId: null },
  })

  return NextResponse.json({ success: true })
}
