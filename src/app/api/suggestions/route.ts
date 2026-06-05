import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  title:       z.string().min(5).max(150),
  content:     z.string().min(10).max(2000),
  authorName:  z.string().min(2).max(60),
  authorEmail: z.string().email().optional().or(z.literal('')),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const sort   = searchParams.get('sort') ?? 'votes'

  const suggestions = await prisma.suggestion.findMany({
    where: {
      ...(status && status !== 'all' ? { status } : {}),
    },
    orderBy: sort === 'votes'
      ? [{ upvotes: 'desc' }, { createdAt: 'desc' }]
      : { createdAt: 'desc' },
  })

  return NextResponse.json(suggestions)
}

export async function POST(req: NextRequest) {
  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const suggestion = await prisma.suggestion.create({
    data: {
      title:       parsed.data.title,
      content:     parsed.data.content,
      authorName:  parsed.data.authorName,
      authorEmail: parsed.data.authorEmail || null,
      status:      'pending',
    },
  })

  return NextResponse.json(suggestion, { status: 201 })
}
