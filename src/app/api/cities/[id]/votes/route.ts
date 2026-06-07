import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const votes = await prisma.cityVote.findMany({
    where:   { cityId: params.id, published: true },
    orderBy: { createdAt: 'desc' },
    include: { responses: true },
  })
  return NextResponse.json(votes)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { title, description, options, endDate, published } = await req.json()
  if (!title?.trim() || !options?.length) {
    return NextResponse.json({ error: 'Titre et options requis' }, { status: 400 })
  }

  const vote = await prisma.cityVote.create({
    data: {
      cityId:      params.id,
      title:       title.trim(),
      description: description?.trim() || null,
      options:     JSON.stringify(options),
      endDate:     endDate ? new Date(endDate) : null,
      published:   !!published,
    },
  })
  return NextResponse.json(vote, { status: 201 })
}
