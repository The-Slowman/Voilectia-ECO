import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const page = await prisma.customPage.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }], published: true },
  })
  if (!page) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json(page)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { type, ...data } = await req.json()

  if (type === 'navitem') {
    const item = await prisma.navItem.update({ where: { id: params.id }, data })
    return NextResponse.json(item)
  }
  const page = await prisma.customPage.update({ where: { id: params.id }, data })
  return NextResponse.json(page)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  if (type === 'navitem') {
    await prisma.navItem.delete({ where: { id: params.id } })
  } else {
    await prisma.customPage.delete({ where: { id: params.id } })
  }
  return NextResponse.json({ success: true })
}
