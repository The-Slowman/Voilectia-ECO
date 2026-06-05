import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
})

export async function POST(req: NextRequest) {
  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })

  await prisma.contactMessage.create({ data: parsed.data })

  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  // Auth required
  const { auth } = await import('@/lib/auth')
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take:    50,
  })
  return NextResponse.json(messages)
}
