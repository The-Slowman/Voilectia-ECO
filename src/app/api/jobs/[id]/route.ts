import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'

function adminGuard(session: Awaited<ReturnType<typeof auth>>) {
  return !session?.user || !hasRole((session.user as { role?: string }).role ?? '', 'ADMIN')
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (adminGuard(session)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const { name, description, icon, color, order, active } = await req.json()
    const job = await prisma.job.update({
      where: { id: params.id },
      data: {
        ...(name        !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(icon        !== undefined && { icon }),
        ...(color       !== undefined && { color }),
        ...(order       !== undefined && { order }),
        ...(active      !== undefined && { active }),
      },
    })
    return NextResponse.json(job)
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (adminGuard(session)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    // Désassocier les joueurs avant de supprimer
    await prisma.user.updateMany({ where: { jobId: params.id }, data: { jobId: null } })
    await prisma.job.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
