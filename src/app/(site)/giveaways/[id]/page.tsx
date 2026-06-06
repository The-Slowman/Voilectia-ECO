import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { GiveawayDetail } from '@/components/ui/GiveawayDetail'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const g = await prisma.giveaway.findUnique({ where: { id: params.id } }).catch(() => null)
  if (!g) return { title: 'Giveaway introuvable' }
  return {
    title: `${g.title} — Voilectia ECO`,
    description: g.description.slice(0, 160),
    openGraph: { title: g.title, description: g.description.slice(0, 160), images: g.image ? [g.image] : [] },
  }
}

export default async function GiveawayPage({ params }: { params: { id: string } }) {
  const giveaway = await prisma.giveaway.findUnique({
    where: { id: params.id, published: true },
    include: { _count: { select: { entries: true } } },
  }).catch(() => null)

  if (!giveaway) notFound()

  return <GiveawayDetail giveaway={giveaway} />
}
