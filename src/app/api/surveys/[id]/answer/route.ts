import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { answers, sessionToken } = await req.json()
  // answers = [{ questionId, response }]

  if (!sessionToken || !Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  // Vérifier que le sondage existe et est ouvert
  const survey = await prisma.survey.findUnique({ where: { id: params.id } })
  if (!survey || !survey.published || !survey.open) {
    return NextResponse.json({ error: 'Sondage indisponible' }, { status: 400 })
  }
  if (survey.endDate && new Date(survey.endDate) < new Date()) {
    return NextResponse.json({ error: 'Sondage terminé' }, { status: 400 })
  }

  // Anti-doublon : vérifier si ce token a déjà répondu à une question de ce sondage
  const existing = await prisma.surveyAnswer.findFirst({
    where: { surveyId: params.id, sessionToken },
  })
  if (existing) {
    return NextResponse.json({ error: 'Vous avez déjà répondu à ce sondage.' }, { status: 409 })
  }

  // Insérer toutes les réponses
  await prisma.surveyAnswer.createMany({
    data: answers.map((a: { questionId: string; response: string | string[] }) => ({
      questionId:   a.questionId,
      surveyId:     params.id,
      response:     typeof a.response === 'string' ? a.response : JSON.stringify(a.response),
      sessionToken,
    })),
    skipDuplicates: true,
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
