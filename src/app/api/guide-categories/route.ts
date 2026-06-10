import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { getGuideCategories, ensureGuideCategoryTable } from '@/lib/guide-categories'

const schema = z.object({
  name:  z.string().trim().min(1, 'Nom requis').max(50),
  slug:  z.string().trim().max(50).optional(),
  icon:  z.string().trim().max(20).optional().nullable(),
  order: z.number().int().min(0).max(999).optional(),
})

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)
}

// GET — public
export async function GET() {
  const cats = await getGuideCategories()
  return NextResponse.json(cats)
}

// POST — admin
export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorise.' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Requete invalide.' }, { status: 400 }) }
  const p = schema.safeParse(body)
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? 'Donnees invalides.' }, { status: 400 })

  await ensureGuideCategoryTable()
  const slug = (p.data.slug && p.data.slug.trim()) ? slugify(p.data.slug) : slugify(p.data.name)
  if (!slug) return NextResponse.json({ error: 'Slug invalide.' }, { status: 400 })

  const exists = await prisma.guideCategory.findUnique({ where: { slug } })
  if (exists) return NextResponse.json({ error: 'Une categorie a deja ce slug.' }, { status: 409 })

  const cat = await prisma.guideCategory.create({
    data: { name: p.data.name, slug, icon: p.data.icon ?? null, order: p.data.order ?? 0 },
  })
  return NextResponse.json(cat, { status: 201 })
}
