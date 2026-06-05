import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  if (!token) return NextResponse.json({})

  const votes = await prisma.suggestionVote.findMany({
    where: { voterToken: token },
    select: { suggestionId: true, vote: true },
  })

  const voteMap: Record<string, 'up' | 'down'> = {}
  for (const v of votes) voteMap[v.suggestionId] = v.vote as 'up' | 'down'

  return NextResponse.json(voteMap)
}
