import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

// GET /api/page-content?page=presentation — lecture publique
export async function GET(req: NextRequest) {
  const page = new URL(req.url).searchParams.get('page')
  if (!page) return NextResponse.json({})

  const blocks = await prisma.pageContent.findMany({ where: { page } })
  const result = Object.fromEntries(blocks.map(b => [b.key, b.value]))
  return NextResponse.json(result)
}

// POST /api/page-content — sauvegarde (admin)
export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { page, key, value, type, label } = await req.json()
  if (!page || !key) return NextResponse.json({ error: 'page et key requis.' }, { status: 400 })

  const block = await prisma.pageContent.upsert({
    where:  { page_key: { page, key } },
    update: { value, type: type ?? 'text', label },
    create: { page, key, value, type: type ?? 'text', label },
  })
  return NextResponse.json(block)
}
