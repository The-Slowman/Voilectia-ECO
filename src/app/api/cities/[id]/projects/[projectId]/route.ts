import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPlayerFromRequest } from '@/lib/player-auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string; projectId: string } }) {
  const user = await getPlayerFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })

  const data = await req.json()
  const project = await prisma.cityProject.update({
    where: { id: params.projectId },
    data,
  })
  return NextResponse.json(project)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; projectId: string } }) {
  const user = await getPlayerFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })

  await prisma.cityProject.delete({ where: { id: params.projectId } })
  return NextResponse.json({ success: true })
}
