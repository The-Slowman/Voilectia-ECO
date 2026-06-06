import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, hasRole } from '@/lib/auth'
import { parseBody, jobProgressionSchema } from '@/lib/validate'
import { logAudit } from '@/lib/audit'

export async function GET() {
  try {
    await prisma.serverConfig.upsert({
      where: { id: 'singleton' }, create: { id: 'singleton' }, update: {},
    })
    const progressions = await prisma.jobProgression.findMany({
      where: { configId: 'singleton' },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(progressions)
  } catch (err) {
    console.error('[progressions GET]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !hasRole(session.user.role, 'ADMIN'))
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { data, error } = await parseBody(req, jobProgressionSchema)
  if (error) return error

  try {
    const prog = await prisma.jobProgression.create({
      data: { configId: 'singleton', ...data },
    })
    await logAudit({ userId: session.user.id, userName: session.user.name, action: 'CREATE', resource: 'job_progression', resourceId: prog.id, req })
    return NextResponse.json(prog, { status: 201 })
  } catch (err) {
    console.error('[progressions POST]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
