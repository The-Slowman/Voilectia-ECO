import { NextRequest } from 'next/server'
import { prisma } from './db'

export const COOKIE_NAME = 'voilectia_session'

export async function getPlayerFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const user = await prisma.user.findUnique({
    where: { playerToken: token },
    include: { job: true, playerRank: true },
  })
  return user
}

export function generatePlayerToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https') ?? false,
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
}
