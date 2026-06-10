import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// DIAGNOSTIC TEMPORAIRE — à supprimer une fois le login réparé.
// Ouvrir dans le navigateur : https://voilectia.fr/api/admin/auth/diag
export const dynamic = 'force-dynamic'

export async function GET() {
  const out: Record<string, unknown> = { ok: true }

  // 1) Connexion BDD
  try {
    await prisma.$queryRawUnsafe('SELECT 1')
    out.dbConnected = true
  } catch (e) {
    out.dbConnected = false
    out.dbError = e instanceof Error ? e.message.slice(0, 250) : String(e)
    return NextResponse.json(out)
  }

  // 2) Table admin_sessions
  try {
    await prisma.$queryRawUnsafe('SELECT 1 FROM `admin_sessions` LIMIT 1')
    out.adminSessionsTable = true
  } catch (e) {
    out.adminSessionsTable = false
    out.adminSessionsError = e instanceof Error ? e.message.slice(0, 250) : String(e)
  }

  // 3) Comptes
  try {
    out.userCount = await prisma.user.count()
    out.superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } })
  } catch (e) {
    out.userCountError = e instanceof Error ? e.message.slice(0, 250) : String(e)
  }

  // 4) Lecture d'un user (révèle les colonnes manquantes éventuelles)
  try {
    await prisma.user.findFirst({ select: { id: true, email: true, role: true, rank: true } })
    out.userSelectOk = true
  } catch (e) {
    out.userSelectOk = false
    out.userSelectError = e instanceof Error ? e.message.slice(0, 250) : String(e)
  }

  return NextResponse.json(out)
}
