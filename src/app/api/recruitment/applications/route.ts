import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('postId')

  const apps = await prisma.recruitmentApplication.findMany({
    where:   postId ? { postId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { post: { select: { title: true, color: true } } },
  })
  return NextResponse.json(apps)
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id, status, adminNote } = await req.json()
  const app = await prisma.recruitmentApplication.update({
    where: { id },
    data:  { status, adminNote: adminNote ?? undefined },
  })
  return NextResponse.json(app)
}
