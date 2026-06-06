import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseBody, giveawayEntrySchema } from '@/lib/validate'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await parseBody(req, giveawayEntrySchema)
  if (error) return error

  try {
    const giveaway = await prisma.giveaway.findUnique({ where: { id: params.id } })
    if (!giveaway || !giveaway.published)
      return NextResponse.json({ error: 'Giveaway introuvable.' }, { status: 404 })
    if (giveaway.ended || new Date() > giveaway.endDate)
      return NextResponse.json({ error: 'Ce giveaway est terminé.' }, { status: 400 })

    // Vérifier doublon par email
    if (data.email) {
      const existing = await prisma.giveawayEntry.findFirst({
        where: { giveawayId: params.id, email: data.email },
      })
      if (existing) return NextResponse.json({ error: 'Vous participez déjà.' }, { status: 409 })
    }

    const entry = await prisma.giveawayEntry.create({
      data: { giveawayId: params.id, ...data },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    console.error('[giveaway enter]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
