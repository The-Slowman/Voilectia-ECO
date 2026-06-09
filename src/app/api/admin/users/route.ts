import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getAdminFromRequest, ADMIN_ROLES, type AdminRole } from '@/lib/admin-auth'
import { logAudit } from '@/lib/audit'

const createSchema = z.object({
  name:     z.string().trim().min(2, 'Nom trop court').max(60),
  email:    z.string().trim().email('Email invalide').max(160),
  password: z.string().min(8, 'Mot de passe : 8 caractères minimum').max(200),
  role:     z.enum(ADMIN_ROLES),
})

// GET — liste des comptes admin (fondateur uniquement)
export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req, 'SUPER_ADMIN')
  if (!admin) return NextResponse.json({ error: 'Réservé au fondateur.' }, { status: 403 })

  const users = await prisma.user.findMany({
    where:   { role: { in: ADMIN_ROLES as unknown as string[] } },
    orderBy: { createdAt: 'asc' },
    select:  { id: true, name: true, email: true, role: true, createdAt: true, lastLoginAt: true },
  })
  return NextResponse.json({ users })
}

// POST — créer un compte admin/staff (fondateur uniquement)
export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req, 'SUPER_ADMIN')
  if (!admin) return NextResponse.json({ error: 'Réservé au fondateur.' }, { status: 403 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Données invalides.'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
  const { name, email, password, role } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), password: hashed, role: role as AdminRole },
    select: { id: true, name: true, email: true, role: true, createdAt: true, lastLoginAt: true },
  })

  await logAudit({ userId: admin.id, userName: admin.name, action: 'CREATE', resource: `admin-user:${user.email}`, req })

  return NextResponse.json({ user }, { status: 201 })
}
