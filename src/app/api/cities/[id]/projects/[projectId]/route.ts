import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string; projectId: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const project = await prisma.cityProject.update({
    where: { id: params.projectId },
    data,
  })
  return NextResponse.json(project)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; projectId: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.cityProject.delete({ where: { id: params.projectId } })
  return NextResponse.json({ success: true })
}
