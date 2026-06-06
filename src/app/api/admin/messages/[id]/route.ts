import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'

// PATCH — marquer lu/non-lu
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || !hasRole(session.user.role, 'ADMIN'))
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    const { read } = await req.json()
    const msg = await prisma.contactMessage.update({
      where: { id: params.id },
      data: { read: !!read },
    })
    return NextResponse.json(msg)
  } catch (err) {
    console.error('[admin message PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || !hasRole(session.user.role, 'ADMIN'))
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    await prisma.contactMessage.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin message DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
