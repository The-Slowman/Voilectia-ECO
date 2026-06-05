import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const medias = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(medias)
}
