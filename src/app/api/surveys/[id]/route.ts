import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

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
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.survey.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
