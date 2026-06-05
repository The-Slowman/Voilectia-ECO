import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const REASONS = ['spam', 'harcelement', 'hors-sujet', 'contenu-inapproprie', 'autre']

// GET — admin : liste des signalements en attente
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'pending'

  const reports = await prisma.forumReport.findMany({
    where:   { status },
    orderBy: { createdAt: 'desc' },
    include: {
      post:    { select: { id: true, title: true, slug: true, category: { select: { slug: true } } } },
      comment: { select: { id: true, content: true, authorName: true } },
    },
  })
  return NextResponse.json(reports)
}

// POST — public : signaler un post ou un commentaire
export async function POST(req: NextRequest) {
  const { postId, commentId, reason, details, reporterToken } = await req.json()

  if (!reason || !reporterToken || (!postId && !commentId)) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }
  if (!REASONS.includes(reason)) {
    return NextResponse.json({ error: 'Raison invalide' }, { status: 400 })
  }

  // Anti-spam : un seul signalement par token par cible
  const existingReport = await prisma.forumReport.findFirst({
    where: {
      reporterToken,
      ...(postId ? { postId } : { commentId }),
    },
  })
  if (existingReport) {
    return NextResponse.json({ error: 'Vous avez déjà signalé cet élément.' }, { status: 409 })
  }

  const report = await prisma.forumReport.create({
    data: {
      reason,
      details:       details?.trim() || null,
      reporterToken,
      postId:    postId    ?? null,
      commentId: commentId ?? null,
    },
  })
  return NextResponse.json(report, { status: 201 })
}

// PATCH — admin : changer le statut d'un signalement
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id, status } = await req.json()
  const report = await prisma.forumReport.update({
    where: { id },
    data:  { status },
  })
  return NextResponse.json(report)
}
