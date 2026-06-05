import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'

function requireAdmin(session: { user?: { role?: string } } | null) {
  return session?.user && hasRole((session.user as { role?: string }).role ?? '', 'ADMIN')
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const survey = await prisma.survey.findUnique({
    where:   { id: params.id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: {
          answers: { select: { response: true, sessionToken: true } },
        },
      },
    },
  })
  if (!survey) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json(survey)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!requireAdmin(session)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const survey = await prisma.survey.update({
    where: { id: params.id },
    data:  {
      ...data,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  })
  return NextResponse.json(survey)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!requireAdmin(session)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.survey.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
