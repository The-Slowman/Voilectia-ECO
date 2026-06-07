import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { type, ...data } = await req.json()
  if (type === 'category') {
    const cat = await prisma.faqCategory.update({ where: { id: params.id }, data })
    return NextResponse.json(cat)
  }
  const item = await prisma.faqItem.update({ where: { id: params.id }, data })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  if (type === 'category') {
    await prisma.faqCategory.delete({ where: { id: params.id } })
  } else {
    await prisma.faqItem.delete({ where: { id: params.id } })
  }
  return NextResponse.json({ success: true })
}
