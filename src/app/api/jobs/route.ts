import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'

export async function GET() {
  const jobs = await prisma.job.findMany({
    where:   { active: true },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(jobs)
}

export async function POST(req: NextRequest) {
  const session = await auth() as { user?: { role?: string } } | null
  if (!session?.user || !hasRole(session.user.role ?? '', 'ADMIN')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  try {
    const { name, description, icon, color, order } = await req.json()
    if (!name) return NextResponse.json({ error: 'Nom requis.' }, { status: 400 })

    const job = await prisma.job.create({
      data: {
        name,
        description: description || null,
        icon:        icon        || null,
        color:       color       || '#3A7A52',
        order:       order       ?? 0,
      },
    })
    return NextResponse.json(job, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Ce métier existe déjà.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
