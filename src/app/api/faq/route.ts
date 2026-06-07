import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET() {
  const [categories, items] = await Promise.all([
    prisma.faqCategory.findMany({ orderBy: { order: 'asc' } }),
    prisma.faqItem.findMany({ orderBy: [{ categoryId: 'asc' }, { order: 'asc' }] }),
  ])
  return NextResponse.json({ categories, items })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { type, ...data } = await req.json()

  if (type === 'category') {
    const cat = await prisma.faqCategory.create({ data })
    return NextResponse.json(cat, { status: 201 })
  }
  const item = await prisma.faqItem.create({ data })
  return NextResponse.json(item, { status: 201 })
}
