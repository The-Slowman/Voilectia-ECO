import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

// GET — fiche complète d'un membre
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const [
    user, articles, guides, changelogs, auditLogs,
    forumPostCount, suggestionCount, dmSentCount,
    recentForumPosts, recentSuggestions,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, name: true, email: true, role: true, avatar: true,
        ecoName: true, discordTag: true, bio: true,
        banned: true, createdAt: true, lastLoginAt: true, updatedAt: true,
        job:        { select: { id: true, name: true } },
        playerRank: { select: { id: true, name: true, color: true } },
        rank:       { select: { id: true, name: true } },
      },
    }),
    prisma.article.count({ where: { authorId: params.id } }),
    prisma.guide.count({ where: { authorId: params.id } }),
    prisma.changelog.count({ where: { authorId: params.id } }),
    prisma.auditLog.findMany({
      where: { userId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.forumPost.count({ where: { authorUserId: params.id } }),
    prisma.suggestion.count({ where: { authorUserId: params.id } }),
    prisma.directMessage.count({ where: { senderId: params.id } }),
    prisma.forumPost.findMany({
      where: { authorUserId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, approved: true, createdAt: true, views: true },
    }),
    prisma.suggestion.findMany({
      where: { authorUserId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, status: true, createdAt: true, upvotes: true },
    }),
  ])

  if (!user) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 })

  return NextResponse.json({
    user,
    stats: { articles, guides, changelogs, forumPostCount, suggestionCount, dmSentCount },
    auditLogs,
    recentForumPosts,
    recentSuggestions,
  })
}

// PATCH — modifier un membre (métier, rang, ban, etc.)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const { jobId, playerRankId, banned, ecoName, discordTag } = await req.json()

  const updated = await prisma.user.update({
    where: { id: params.id, role: 'PLAYER' },
    data: {
      ...(jobId        !== undefined && { jobId:        jobId        || null }),
      ...(playerRankId !== undefined && { playerRankId: playerRankId || null }),
      ...(banned       !== undefined && { banned, ...(banned ? { playerToken: null } : {}) }),
      ...(ecoName      !== undefined && { ecoName }),
      ...(discordTag   !== undefined && { discordTag }),
    },
    include: { job: true, playerRank: true },
  })

  return NextResponse.json(updated)
}

// DELETE — supprimer un compte joueur
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminFromRequest(req, 'SUPER_ADMIN')
  if (!admin) return NextResponse.json({ error: 'Réservé au Super Admin.' }, { status: 403 })

  await prisma.user.delete({ where: { id: params.id, role: 'PLAYER' } })
  return NextResponse.json({ ok: true })
}
