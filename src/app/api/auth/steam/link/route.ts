import { NextResponse } from 'next/server'

// Système Steam retiré
export async function POST() { return NextResponse.json({ error: 'Steam retiré.' }, { status: 410 }) }
export async function DELETE() { return NextResponse.json({ error: 'Steam retiré.' }, { status: 410 }) }
