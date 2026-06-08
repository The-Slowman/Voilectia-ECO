import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitize'

interface Props { params: { slug: string } }

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  news:         { label: 'Actualité',   color: 'text-[#2D6A4F] bg-[rgba(58,122,82,0.12)] border-[rgba(58,122,82,0.25)]' },
  announcement: { label: 'Annonce',     color: 'text-[#A07810] bg-[var(--gold-pale)] border-[rgba(212,168,32,0.3)]' },
  update:       { label: 'Mise à jour', color: 'text-[#1A6A8A] bg-[rgba(74,158,196,0.1)] border-[rgba(74,158,196,0.25)]' },
}

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where:  { slug, published: true },
    select: {
      id: true, title: true, slug: true, excerpt: true,
      content: true, coverImage: true, category: true,
      createdAt: true, metaTitle: true, metaDesc: true, ogImage: true,
      author: { select: { name: true } },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug)
  if (!article) return { title: 'Article introuvable' }
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://voilectia.fr'
  const image    = article.ogImage ?? article.coverImage ?? `${SITE_URL}/images/og-default.jpg`
  return {
    title:       article.metaTitle ?? article.title,
    description: article.metaDesc  ?? article.excerpt ?? undefined,
    openGraph: {
      title:       article.metaTitle ?? article.title,
      description: article.metaDesc  ?? article.excerpt ?? undefined,
      images:      [{ url: image }],
      type:        'article',
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug)
  if (!article) notFound()

  const cat = CATEGORY_LABELS[article.category] ?? CATEGORY_LABELS.news

  return (
    <div className="min-h-screen bg-[#F2E8D5]">
      {/* Hero image */}
      {article.coverImage && (
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A3D2B]/80 via-[#1A3D2B]/20 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Retour */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#6B8C6A] hover:text-[#2D6A4F] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Retour à l'accueil
        </Link>

        {/* Catégorie */}
        <div className="mb-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cat.color}`}>
            <Tag size={10} />
            {cat.label}
          </span>
        </div>

        {/* Titre */}
        <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-[#1A3D2B] leading-tight mb-4">
          {article.title}
        </h1>

        {/* Méta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#9AB09A] mb-6 pb-6 border-b border-[#DBCAA8]">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            {formatDate(article.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <User size={13} />
            {article.author.name}
          </span>
        </div>

        {/* Extrait */}
        {article.excerpt && (
          <p className="text-[#4A6741] text-base sm:text-lg leading-relaxed italic mb-8 pl-4 border-l-4 border-[#D4A820]">
            {article.excerpt}
          </p>
        )}

        {/* Contenu */}
        <div
          className="rich-content text-[#1A3D2B] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
        />

        {/* Pied de page */}
        <div className="mt-12 pt-8 border-t border-[#DBCAA8]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A3D2B] text-[#F2E8D5] rounded-xl text-sm font-semibold hover:bg-[#2D6A4F] transition-colors"
          >
            <ArrowLeft size={14} />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
