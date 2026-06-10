import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

const schema = z.object({
  groupId:     z.string().min(1, 'Groupe requis'),
  label:       z.string().trim().min(1, 'Libellé requis').max(80),
  value:       z.string().trim().min(1, 'Valeur requise').max(120),
  description: z.string().max(500).optional().nullable(),
  icon:        z.string().trim().max(20).optional().nullable(),
  order:       z.number().int().min(0).max(999).optional(),
  isPublic:    z.boolean().optional(),
})

// POST — créer une ligne de configuration (admin)
export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }
  const p = schema.safeParse(body)
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? 'Données invalides.' }, { status: 400 })

  const item = await prisma.serverConfigItem.create({
    data: {
      groupId:     p.data.groupId,
      label:       p.data.label,
      value:       p.data.value,
      description: p.data.description ?? null,
      icon:        p.data.icon ?? null,
      order:       p.data.order ?? 0,
      isPublic:    p.data.isPublic ?? true,
    },
  })
  return NextResponse.json(item, { status: 201 })
}
