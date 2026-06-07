import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { getPlayerFromRequest } from '@/lib/player-auth'
import { z } from 'zod'

const schema = z.object({
  postId:  z.string().min(1),
  content: z.string().min(2).max(2000),
})

// GET — admin : liste commentaires (filtrable par postId ou en attente)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const postId  = searchParams.get('postId')
  const pending = searchParams.get('pending') === '1'

  const admin = await getAdminFromRequest(req)
  const isAdmin = !!admin

  const comments = await prisma.forumComment.findMany({
    where: {
      ...(postId  ? { postId }          : {}),
      ...(pending ? { approved: false } : {}),
      ...(isAdmin ? {} : { approved: true }),
    },
    orderBy: { createdAt: 'asc' },
    include: {
      post: { select: { title: true, slug: true, category: { select: { slug: true } } } },
    },
  })
  return NextResponse.json(comments)
}

// POST — joueur connecté requis
export async function POST(req: NextRequest) {
  const user = await getPlayerFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Connexion requise pour commenter.' }, { status: 401 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { postId, content } = parsed.data

  // Vérifier que le post existe, est approuvé et n'est pas fermé
  const post = await prisma.forumPost.findUnique({ where: { id: postId } })
  if (!post?.approved) return NextResponse.json({ error: 'Post introuvable' }, { status: 404 })
  if (post.closed) return NextResponse.json({ error: 'Ce post est fermé aux nouveaux commentaires.' }, { status: 403 })

  const comment = await prisma.forumComment.create({
    data: {
      postId, content,
      authorName:   user.name,
      authorEmail:  user.email,
      authorUserId: user.id,
      approved:     false,
    },
  })

  return NextResponse.json(comment, { status: 201 })
}
