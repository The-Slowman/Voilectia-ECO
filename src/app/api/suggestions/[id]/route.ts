import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getAdminFromRequest } from '@/lib/admin-auth'

const patchSchema = z.object({
  status:    z.enum(['open', 'under_review', 'accepted', 'rejected']).optional(),
  adminNote: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body   = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const s = await prisma.suggestion.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json(s)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(_req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  await prisma.suggestion.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
