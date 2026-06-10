import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { parseBody, serverConfigSchema } from '@/lib/validate'
import { logAudit } from '@/lib/audit'

async function fetchGroups(includePrivate: boolean) {
  try {
    return await prisma.serverConfigGroup.findMany({
      orderBy: { order: 'asc' },
      include: {
        items: {
          where:   includePrivate ? undefined : { isPublic: true },
          orderBy: { order: 'asc' },
        },
      },
    })
  } catch {
    return []
  }
}

// GET — public (items non publics renvoyes uniquement a un admin connecte)
export async function GET(req: NextRequest) {
  try {
    let config = await prisma.serverConfig.findUnique({
      where:   { id: 'singleton' },
      include: { progressions: { orderBy: { order: 'asc' } } },
    })
    if (!config) {
      config = await prisma.serverConfig.create({
        data:    { id: 'singleton' },
        include: { progressions: { orderBy: { order: 'asc' } } },
      })
    }
    const isAdmin = !!(await getAdminFromRequest(req))
    const groups = await fetchGroups(isAdmin)
    return NextResponse.json({ ...config, groups })
  } catch (err) {
    console.error('[server-config GET]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// PATCH — admin (champs structures)
export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorise.' }, { status: 401 })

  const { data, error } = await parseBody(req, serverConfigSchema)
  if (error) return error

  try {
    const config = await prisma.serverConfig.upsert({
      where:  { id: 'singleton' },
      create: { id: 'singleton', ...data, startDate: data.startDate ? new Date(data.startDate) : undefined, endDate: data.endDate ? new Date(data.endDate) : undefined },
      update: { ...data, startDate: data.startDate ? new Date(data.startDate) : null, endDate: data.endDate ? new Date(data.endDate) : null },
      include: { progressions: { orderBy: { order: 'asc' } } },
    })
    await logAudit({ userId: admin.id, userName: admin.name, action: 'UPDATE', resource: 'server_config', req })
    return NextResponse.json(config)
  } catch (err) {
    console.error('[server-config PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
