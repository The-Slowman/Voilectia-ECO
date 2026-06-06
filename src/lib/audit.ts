import { prisma } from './db'
import { NextRequest } from 'next/server'

export async function logAudit({
  userId,
  userName,
  action,
  resource,
  resourceId,
  detail,
  req,
}: {
  userId:      string
  userName:    string
  action:      'CREATE' | 'UPDATE' | 'DELETE' | 'BAN' | 'UNBAN' | 'LOGIN' | 'LOGOUT' | 'PUBLISH' | 'UNPUBLISH'
  resource:    string
  resourceId?: string
  detail?:     string
  req?:        NextRequest
}) {
  try {
    const ip =
      req?.headers.get('x-real-ip') ??
      req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      undefined

    await prisma.auditLog.create({
      data: { userId, userName, action, resource, resourceId, detail, ip },
    })
  } catch {
    // Ne jamais crasher l'action principale à cause du log
  }
}
