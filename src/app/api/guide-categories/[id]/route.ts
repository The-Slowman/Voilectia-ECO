import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

const schema = z.object({
  name:  z.string().trim().min(1).max(50).optional(),
  icon:  z.string().trim().max(20).optional().nullable(),
  order: z.number().int().min(0).max(999).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorise.' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Requete invalide.' }, { status: 400 }) }
  const p = schema.safeParse(body)
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? 'Donnees invalides.' }, { status: 400 })

  const cat = await prisma.guideCategory.update({ where: { id: params.id }, data: p.data })
  return NextResponse.json(cat)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorise.' }, { status: 401 })

  await prisma.guideCategory.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
