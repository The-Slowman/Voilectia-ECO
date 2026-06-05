import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET — liste des projets
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const projects = await prisma.cityProject.findMany({
    where:   { cityId: params.id },
    orderBy: { createdAt: 'desc' },
    include: {
      participants: true,
      collabFrom:   {
        include: { partnerCity: { select: { name: true, slug: true, accentColor: true } } },
      },
    },
  })
  return NextResponse.json(projects)
}

// POST — proposer un projet (public ou admin)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { title, description, budget, startDate, endDate, authorName } = body

  if (!title?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'Titre et description requis' }, { status: 400 })
  }

  const project = await prisma.cityProject.create({
    data: {
      cityId:      params.id,
      title:       title.trim(),
      description: description.trim(),
      budget:      budget ? parseInt(budget) : null,
      startDate:   startDate ? new Date(startDate) : null,
      endDate:     endDate   ? new Date(endDate)   : null,
      status:      'proposed',
      progress:    0,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
