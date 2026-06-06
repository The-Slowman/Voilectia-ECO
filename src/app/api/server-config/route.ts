import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'
import { parseBody, serverConfigSchema } from '@/lib/validate'
import { logAudit } from '@/lib/audit'

// GET — public
export async function GET() {
  try {
    let config = await prisma.serverConfig.findUnique({
      where: { id: 'singleton' },
      include: { progressions: { orderBy: { order: 'asc' } } },
    })
    if (!config) {
      config = await prisma.serverConfig.create({
        data: { id: 'singleton' },
        include: { progressions: { orderBy: { order: 'asc' } } },
      })
    }
    return NextResponse.json(config)
  } catch (err) {
    console.error('[server-config GET]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// PATCH — admin
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !hasRole(session.user.role, 'ADMIN'))
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { data, error } = await parseBody(req, serverConfigSchema)
  if (error) return error

  try {
    const config = await prisma.serverConfig.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...data, startDate: data.startDate ? new Date(data.startDate) : undefined, endDate: data.endDate ? new Date(data.endDate) : undefined },
      update: { ...data, startDate: data.startDate ? new Date(data.startDate) : null, endDate: data.endDate ? new Date(data.endDate) : null },
      include: { progressions: { orderBy: { order: 'asc' } } },
    })
    await logAudit({ userId: session.user.id, userName: session.user.name, action: 'UPDATE', resource: 'server_config', req })
    return NextResponse.json(config)
  } catch (err) {
    console.error('[server-config PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
