import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json(null)

  const user = await prisma.user.findUnique({
    where:   { id: admin.id },
    include: { rank: true },
  })
  if (!user) return NextResponse.json(null)

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, rank: user.rank })
}
