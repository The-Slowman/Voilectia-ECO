import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { sanitizeHtml } from '@/lib/sanitize'

// GET public — postes ouverts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const adminView = searchParams.get('admin') === '1'

  const admin = adminView ? await getAdminFromRequest(req) : null
  const isAdmin = !!admin

  const posts = await prisma.recruitmentPost.findMany({
    where:   adminView && isAdmin ? undefined : { open: true },
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { applications: true } },
    },
  })
  // Sanitisation du HTML riche (description) avant rendu client
  const safe = posts.map(p => ({ ...p, description: sanitizeHtml(p.description) }))
  return NextResponse.json(safe)
}

// POST admin — créer un poste
export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const data = await req.json()
  const post = await prisma.recruitmentPost.create({
    data: {
      ...data,
      description:  typeof data.description === 'string' ? sanitizeHtml(data.description) : data.description,
      requirements: JSON.stringify(data.requirements ?? []),
      perks:        JSON.stringify(data.perks ?? []),
    },
  })
  return NextResponse.json(post, { status: 201 })
}
