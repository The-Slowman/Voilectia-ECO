import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

const schema = z.object({
  label:       z.string().trim().min(1).max(80).optional(),
  value:       z.string().trim().min(1).max(120).optional(),
  description: z.string().max(500).optional().nullable(),
  icon:        z.string().trim().max(20).optional().nullable(),
  order:       z.number().int().min(0).max(999).optional(),
  isPublic:    z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }
  const p = schema.safeParse(body)
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? 'Données invalides.' }, { status: 400 })

  const item = await prisma.serverConfigItem.update({ where: { id: params.id }, data: p.data })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  await prisma.serverConfigItem.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
