import { NextResponse } from 'next/server'

// Système Steam retiré — remplacé par comptes joueurs
export async function GET() {
  return NextResponse.redirect(new URL('/connexion', process.env.NEXT_PUBLIC_SITE_URL ?? 'https://voilectia.fr'))
}
