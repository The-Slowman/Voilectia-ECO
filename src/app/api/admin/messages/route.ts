import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const unread = searchParams.get('unread') === 'true'
  const limit  = 20

  try {
    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where: unread ? { read: false } : {},
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactMessage.count({ where: unread ? { read: false } : {} }),
    ])
    return NextResponse.json({ messages, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[admin messages GET]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
