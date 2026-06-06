import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'
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
  const session = await auth()
  if (!session?.user || !hasRole(session.user.role, 'ADMIN'))
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { data, error } = await parseBody(req, giveawaySchema)
  if (error) return error

  try {
    const g = await prisma.giveaway.create({
      data: { ...data, endDate: new Date(data.endDate) },
    })
    await logAudit({ userId: session.user.id, userName: session.user.name, action: 'CREATE', resource: 'giveaway', resourceId: g.id, req })
    return NextResponse.json(g, { status: 201 })
  } catch (err) {
    console.error('[giveaways POST]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
