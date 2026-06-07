import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { text, type, options, required, order } = await req.json()

  const question = await prisma.surveyQuestion.create({
    data: {
      surveyId: params.id,
      question: text,
      type,
      options:  options ? JSON.stringify(options) : null,
      required: required ?? true,
      order:    order ?? 0,
    },
  })
  return NextResponse.json(question, { status: 201 })
}

export async function PATCH(req: NextRequest, _ctx: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { questionId, text, ...data } = await req.json()
  if (text !== undefined) data.question = text
  if (data.options) data.options = JSON.stringify(data.options)

  const q = await prisma.surveyQuestion.update({ where: { id: questionId }, data })
  return NextResponse.json(q)
}

export async function DELETE(req: NextRequest, _ctx: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { questionId } = await req.json()
  await prisma.surveyQuestion.delete({ where: { id: questionId } })
  return NextResponse.json({ success: true })
}
