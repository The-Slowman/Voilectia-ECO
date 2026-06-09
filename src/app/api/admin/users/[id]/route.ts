import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getAdminFromRequest, ADMIN_ROLES } from '@/lib/admin-auth'
import { logAudit } from '@/lib/audit'

const updateSchema = z.object({
  name:     z.string().trim().min(2).max(60).optional(),
  role:     z.enum(ADMIN_ROLES).optional(),
  password: z.string().min(8).max(200).optional(),
})

// PATCH — modifier un compte admin (fondateur uniquement)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req, 'SUPER_ADMIN')
  if (!admin) return NextResponse.json({ error: 'Réservé au fondateur.' }, { status: 403 })

  const target = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, role: true } })
  if (!target || !ADMIN_ROLES.includes(target.role as typeof ADMIN_ROLES[number]))
    return NextResponse.json({ error: 'Compte introuvable.' }, { status: 404 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides.' }, { status: 400 })

  // Empêcher le fondateur de se rétrograder lui-même (éviter de se verrouiller dehors)
  if (target.id === admin.id && parsed.data.role && parsed.data.role !== 'SUPER_ADMIN')
    return NextResponse.json({ error: 'Vous ne pouvez pas changer votre propre rôle de fondateur.' }, { status: 400 })

  const data: Record<string, unknown> = {}
  if (parsed.data.name) data.name = parsed.data.name
  if (parsed.data.role) data.role = parsed.data.role
  if (parsed.data.password) data.password = await bcrypt.hash(parsed.data.password, 12)

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: 'Rien à mettre à jour.' }, { status: 400 })

  const user = await prisma.user.update({
    where:  { id: params.id },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true, lastLoginAt: true },
  })

  await logAudit({ userId: admin.id, userName: admin.name, action: 'UPDATE', resource: `admin-user:${user.email}`, req })
  return NextResponse.json({ user })
}

// DELETE — supprimer un compte admin (fondateur uniquement)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req, 'SUPER_ADMIN')
  if (!admin) return NextResponse.json({ error: 'Réservé au fondateur.' }, { status: 403 })

  if (params.id === admin.id)
    return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' }, { status: 400 })

  const target = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, email: true, role: true } })
  if (!target || !ADMIN_ROLES.includes(target.role as typeof ADMIN_ROLES[number]))
    return NextResponse.json({ error: 'Compte introuvable.' }, { status: 404 })

  // Ne jamais supprimer le dernier fondateur
  if (target.role === 'SUPER_ADMIN') {
    const founders = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } })
    if (founders <= 1) return NextResponse.json({ error: 'Impossible de supprimer le dernier fondateur.' }, { status: 400 })
  }

  // Supprime aussi ses sessions actives
  await prisma.adminSession.deleteMany({ where: { userId: params.id } }).catch(() => {})
  await prisma.user.delete({ where: { id: params.id } })

  await logAudit({ userId: admin.id, userName: admin.name, action: 'DELETE', resource: `admin-user:${target.email}`, req })
  return NextResponse.json({ success: true })
}
