import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

// GET — liste des membres (admin)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const members = await prisma.cityMembership.findMany({
    where:   { cityId: params.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(members)
}

// POST — demande de rejoindre (public)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { playerName, playerEmail, discordTag, message } = await req.json()

  if (!playerName?.trim()) {
    return NextResponse.json({ error: 'Pseudo requis' }, { status: 400 })
  }

  // Vérifier si déjà membre / en attente
  const existing = await prisma.cityMembership.findFirst({
    where: { cityId: params.id, playerName: playerName.trim() },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'Une demande existe déjà pour ce pseudo.' },
      { status: 409 },
    )
  }

  const membership = await prisma.cityMembership.create({
    data: {
      cityId:      params.id,
      playerName:  playerName.trim(),
      playerEmail: playerEmail?.trim() || null,
      discordTag:  discordTag?.trim() || null,
      message:     message?.trim() || null,
      status:      'pending',
    },
  })

  return NextResponse.json(membership, { status: 201 })
}

// PATCH — approuver/rejeter/changer rôle (admin)
export async function PATCH(req: NextRequest, _ctx: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { memberId, status, role } = await req.json()
  const data: Record<string, unknown> = {}
  if (status) data.status = status
  if (role)   data.role   = role
  if (status === 'approved') data.joinedAt = new Date()

  const m = await prisma.cityMembership.update({ where: { id: memberId }, data })
  return NextResponse.json(m)
}
