import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { parseBody, giveawaySchema } from '@/lib/validate'
import { logAudit } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const onlyPublished = searchParams.get('published') !== 'false'
    const giveaways = await prisma.giveaway.findMany({
      where: onlyPublished ? { published: true } : {},
      include: { _count: { select: { entries: true } } },
      orderBy: { endDate: 'asc' },
    })
    return NextResponse.json(giveaways)
  } catch (err) {
    console.error('[giveaways GET]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { data, error } = await parseBody(req, giveawaySchema)
  if (error) return error

  try {
    const g = await prisma.giveaway.create({
      data: { ...data, endDate: new Date(data.endDate) },
    })
    await logAudit({ userId: admin.id, userName: admin.name, action: 'CREATE', resource: 'giveaway', resourceId: g.id, req })
    return NextResponse.json(g, { status: 201 })
  } catch (err) {
    console.error('[giveaways POST]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
