import { NextRequest, NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'
import { ADMIN_COOKIE, getAdminFromRequest, destroyAdminSession } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const tok = req.cookies.get(ADMIN_COOKIE)?.value
  if (tok) {
    const admin = await getAdminFromRequest(req)
    await destroyAdminSession(tok)
    if (admin) {
      await logAudit({ userId: admin.id, userName: admin.name, action: 'LOGOUT', resource: 'admin', req })
    }
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, '', { maxAge: 0, path: '/' })
  return res
}
