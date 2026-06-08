import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitize'
import { ChevronLeft, Eye, Clock, User } from 'lucide-react'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await prisma.tutorial.findFirst({ where: { slug: params.slug, published: true } })
  if (!t) return { title: 'Introuvable' }
  return { title: t.title, description: t.excerpt ?? undefined }
}

export const revalidate = 300

export default async function TutorialPage({ params }: Props) {
  const tutorial = await prisma.tutorial.findFirst({
    where: { slug: params.slug, published: true },
  })
  if (!tutorial) notFound()

  // Incrémentation des vues côté serveur
  await prisma.tutorial.update({
    where: { id: tutorial.id },
    data:  { views: { increment: 1 } },
  })

  const CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
    debutant:     { label: 'Débutant',       icon: '🌱', color: '#3A7A52' },
    economie:     { label: 'Économie',       icon: '💰', color: '#D4A820' },
    construction: { label: 'Construction',   icon: '🏗️', color: '#4A9EC4' },
    astuce:       { label: 'Astuces',        icon: '💡', color: '#A07810' },
    general:      { label: 'Général',        icon: '📖', color: '#6B8C6A' },
  }
  const catInfo = CATEGORIES[tutorial.category] ?? CATEGORIES.general

  return (
    <div className="bg-[#F2E8D5] min-h-screen">
      {/* Hero */}
      <div className="bg-[#1A3D2B] pt-24 pb-14 relative">
        <div className="absolute inset-0"
             style={{ background: `radial-gradient(ellipse at 50% 0%, ${catInfo.color}25, transparent 60%)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-[3px]"
             style={{ background: `linear-gradient(90deg, transparent, ${catInfo.color}, transparent)` }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/tutoriels"
                className="inline-flex items-center gap-1.5 text-[rgba(242,232,213,0.5)]
                           hover:text-[#F2E8D5] text-xs mb-6 transition-colors">
            <ChevronLeft size={13} /> Tutoriels
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{catInfo.icon}</span>
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: catInfo.color }}>
              {catInfo.label}
            </span>
            {tutorial.featured && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF0C8] text-[#A07810]">
                ⭐ À la une
              </span>
            )}
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-[#F2E8D5] mb-4">
            {tutorial.title}
          </h1>
          <div className="flex items-center gap-5 text-xs text-[rgba(242,232,213,0.5)]">
            {tutorial.authorName && (
              <span className="flex items-center gap-1.5"><User size={11} /> {tutorial.authorName}</span>
            )}
            <span className="flex items-center gap-1.5"><Clock size={11} /> {formatDate(tutorial.createdAt)}</span>
            <span className="flex items-center gap-1.5"><Eye size={11} /> {tutorial.views} lectures</span>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-20">
        <div className="bg-white border border-[#DBCAA8] rounded-2xl p-8 shadow-sm">
          {tutorial.excerpt && (
            <p className="text-[#6B8C6A] italic border-l-4 pl-4 mb-8 text-base leading-relaxed"
               style={{ borderColor: catInfo.color }}>
              {tutorial.excerpt}
            </p>
          )}
          <div
            className="rich-content prose prose-sm max-w-none text-[#1A3D2B]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(tutorial.content) }}
          />
        </div>

        <div className="mt-8 text-center">
          <Link href="/tutoriels"
                className="inline-flex items-center gap-2 text-sm text-[#6B8C6A] hover:text-[#1A3D2B] transition-colors">
            <ChevronLeft size={14} /> Voir tous les tutoriels
          </Link>
        </div>
      </div>
    </div>
  )
}
