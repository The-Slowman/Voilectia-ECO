import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

const schema = z.object({
  title: z.string().trim().min(1, 'Titre requis').max(80),
  icon:  z.string().trim().max(20).optional().nullable(),
  order: z.number().int().min(0).max(999).optional(),
})

// POST — créer un groupe de configuration (admin)
export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }
  const p = schema.safeParse(body)
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? 'Données invalides.' }, { status: 400 })

  const group = await prisma.serverConfigGroup.create({
    data: { title: p.data.title, icon: p.data.icon ?? null, order: p.data.order ?? 0 },
  })
  return NextResponse.json(group, { status: 201 })
}
