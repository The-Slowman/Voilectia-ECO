import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    await prisma.user.updateMany({ where: { jobId: params.id }, data: { jobId: null } })
    await prisma.job.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
