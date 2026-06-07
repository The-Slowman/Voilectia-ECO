import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getAdminFromRequest } from '@/lib/admin-auth'

const patchSchema = z.object({
  content: z.string().min(1),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body   = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const c = await prisma.forumComment.update({ where: { id: params.id }, data: { content: parsed.data.content } })
  return NextResponse.json(c)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(_req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  await prisma.forumComment.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
