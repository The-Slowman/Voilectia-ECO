import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({ token: z.string().min(1) })

export async function POST(req: NextRequest) {
  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  // On enregistre juste le vote (pas de dédup strict — top-serveur.fr gère lui-même)
  await prisma.topServeurVote.create({ data: { voterToken: parsed.data.token } })

  return NextResponse.json({ success: true })
}

export async function GET() {
  const total = await prisma.topServeurVote.count()
  // Ce mois
  const firstOfMonth = new Date(); firstOfMonth.setDate(1); firstOfMonth.setHours(0, 0, 0, 0)
  const thisMonth    = await prisma.topServeurVote.count({ where: { createdAt: { gte: firstOfMonth } } })

  return NextResponse.json({ total, thisMonth })
}
