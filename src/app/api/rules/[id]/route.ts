import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { type, ...data } = await req.json()
  if (type === 'category') {
    const cat = await prisma.ruleCategory.update({ where: { id: params.id }, data })
    return NextResponse.json(cat)
  }
  const rule = await prisma.rule.update({ where: { id: params.id }, data })
  return NextResponse.json(rule)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  if (type === 'category') {
    await prisma.ruleCategory.delete({ where: { id: params.id } })
  } else {
    await prisma.rule.delete({ where: { id: params.id } })
  }
  return NextResponse.json({ success: true })
}
