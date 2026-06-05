import { NextRequest, NextResponse } from 'next/server'
import { buildSteamAuthUrl } from '@/lib/steam'

export async function GET(req: NextRequest) {
  const origin   = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${req.headers.get('host')}`
  const returnTo = `${origin}/api/auth/steam/callback`

  const steamUrl = buildSteamAuthUrl(returnTo, origin)
  return NextResponse.redirect(steamUrl)
}
