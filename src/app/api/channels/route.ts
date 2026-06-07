import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET() {
  const channels = await prisma.channel.findMany({
    where:   { isPublic: true },
    orderBy: { order: 'asc' },
    include: { _count: { select: { messages: true } } },
  })
  return NextResponse.json(channels)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { name, description, icon, color, order } = await req.json()
  if (!name) return NextResponse.json({ error: 'Nom requis.' }, { status: 400 })

  try {
    const channel = await prisma.channel.create({
      data: { name, description, icon, color: color || '#3A7A52', order: order ?? 0 },
    })
    return NextResponse.json(channel, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Ce canal existe déjà.' }, { status: 409 })
  }
}
