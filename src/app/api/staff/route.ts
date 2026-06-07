import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  name:        z.string().min(1),
  role:        z.string().min(1),
  description: z.string().optional(),
  avatar:      z.string().url().optional().or(z.literal('')),
  discordId:   z.string().optional(),
  order:       z.number().default(0),
  active:      z.boolean().default(true),
})

export async function GET() {
  const members = await prisma.staffMember.findMany({
    where:   { active: true },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(members)
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const member = await prisma.staffMember.create({
    data: { ...parsed.data, avatar: parsed.data.avatar || null },
  })
  return NextResponse.json(member, { status: 201 })
}
