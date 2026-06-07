import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET() {
  const [categories, rules] = await Promise.all([
    prisma.ruleCategory.findMany({ orderBy: { order: 'asc' } }),
    prisma.rule.findMany({ orderBy: [{ categoryId: 'asc' }, { order: 'asc' }] }),
  ])
  return NextResponse.json({ categories, rules })
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { type, ...data } = await req.json()
  if (type === 'category') {
    const cat = await prisma.ruleCategory.create({ data })
    return NextResponse.json(cat, { status: 201 })
  }
  const rule = await prisma.rule.create({ data })
  return NextResponse.json(rule, { status: 201 })
}
