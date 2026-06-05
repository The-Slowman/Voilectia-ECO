import { NextResponse } from 'next/server'

// NextAuth retiré — authentification gérée par cookie maison
export async function GET() { return NextResponse.json(null, { status: 404 }) }
export async function POST() { return NextResponse.json(null, { status: 404 }) }
