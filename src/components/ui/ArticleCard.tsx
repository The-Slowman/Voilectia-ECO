import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ArticleCardProps {
  article: {
    id:          string
    title:       string
    slug:        string
    excerpt?:    string | null
    coverImage?: string | null
    category:    string
    createdAt:   Date | string
    author:      { name: string }
  }
}

const CATEGORY_LABELS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  news:         { label: 'Actualité',    bg: 'bg-[rgba(58,122,82,0.1)]',    text: 'text-[#2D6A4F]', border: 'border-[rgba(58,122,82,0.25)]' },
  announcement: { label: 'Annonce',      bg: 'bg-[var(--gold-pale)]',        text: 'text-[#A07810]', border: 'border-[rgba(212,168,32,0.3)]' },
  update:       { label: 'Mise à jour',  bg: 'bg-[rgba(74,158,196,0.1)]',   text: 'text-[#1A6A8A]', border: 'border-[rgba(74,158,196,0.25)]' },
}

export function ArticleCard({ article }: ArticleCardProps) {
  const cat = CATEGORY_LABELS[article.category] ?? CATEGORY_LABELS.news

  return (
    <Link href={`/actualites/${article.slug}`}>
      <article className="card-hover group overflow-hidden h-full flex flex-col bg-white">
        {/* Couverture */}
        <div className="relative h-48 overflow-hidden bg-[#E8D9BF]">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-[#1A3D2B] flex items-center justify-center opacity-20">
              <span className="text-6xl">📰</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
          {/* Badge catégorie */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px]
                              font-bold border ${cat.bg} ${cat.text} ${cat.border}`}>
              {cat.label}
            </span>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-display font-semibold text-base text-[#1A3D2B] mb-2
                         line-clamp-2 group-hover:text-[#2D6A4F] transition-colors">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-[#6B8C6A] text-sm leading-relaxed line-clamp-3 flex-1">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#DBCAA8]
                          text-xs text-[#9AB09A]">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(article.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <User size={11} />
              {article.author.name}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
