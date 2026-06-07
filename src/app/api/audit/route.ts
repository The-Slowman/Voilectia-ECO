import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit    = 50
  const resource = searchParams.get('resource') ?? undefined
  const action   = searchParams.get('action')   ?? undefined
  const userId   = searchParams.get('userId')   ?? undefined

  const where = {
    ...(resource ? { resource } : {}),
    ...(action   ? { action }   : {}),
    ...(userId   ? { userId }   : {}),
  }

  try {
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[audit GET]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
