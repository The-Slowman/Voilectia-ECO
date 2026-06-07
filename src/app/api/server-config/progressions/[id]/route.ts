import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { parseBody, jobProgressionSchema } from '@/lib/validate'
import { logAudit } from '@/lib/audit'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { data, error } = await parseBody(req, jobProgressionSchema.partial())
  if (error) return error

  try {
    const prog = await prisma.jobProgression.update({
      where: { id: params.id },
      data,
    })
    await logAudit({ userId: admin.id, userName: admin.name, action: 'UPDATE', resource: 'job_progression', resourceId: prog.id, req })
    return NextResponse.json(prog)
  } catch (err) {
    console.error('[progressions PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  try {
    await prisma.jobProgression.delete({ where: { id: params.id } })
    await logAudit({ userId: admin.id, userName: admin.name, action: 'DELETE', resource: 'job_progression', resourceId: params.id })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[progressions DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
