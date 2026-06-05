import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { PageHero } from '@/components/ui/PageHero'
import { formatDate } from '@/lib/utils'
import { BookOpen, Eye, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tutoriels & Astuces',
  description: 'Guides pratiques et astuces pour progresser sur Voilectia ECO.',
}
export const revalidate = 120

const CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  debutant:     { label: 'Débutant',       icon: '🌱', color: '#3A7A52' },
  economie:     { label: 'Économie',       icon: '💰', color: '#D4A820' },
  construction: { label: 'Construction',   icon: '🏗️', color: '#4A9EC4' },
  astuce:       { label: 'Astuces',        icon: '💡', color: '#A07810' },
  general:      { label: 'Général',        icon: '📖', color: '#6B8C6A' },
}

export default async function TutorielsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const cat = searchParams.category

  const tutorials = await prisma.tutorial.findMany({
    where: { published: true, ...(cat ? { category: cat } : {}) },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
  })

  const featured  = tutorials.filter(t => t.featured)
  const regular   = tutorials.filter(t => !t.featured)

  return (
    <div>
      <PageHero
        title="Tutoriels & Astuces"
        subtitle="Maîtrisez Voilectia ECO grâce aux guides de la communauté."
        badge="📖 Guides"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-2 py-8">
          <Link href="/tutoriels"
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  !cat ? 'bg-[#1A3D2B] text-[#F2E8D5] border-[#1A3D2B]'
                       : 'bg-white text-[#6B8C6A] border-[#DBCAA8] hover:border-[#1A3D2B]'
                }`}>
            Tous ({tutorials.length})
          </Link>
          {Object.entries(CATEGORIES).map(([key, { label, icon }]) => {
            const count = tutorials.filter(t => t.category === key).length
            if (count === 0) return null
            return (
              <Link key={key} href={`/tutoriels?category=${key}`}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                      cat === key ? 'bg-[#1A3D2B] text-[#F2E8D5] border-[#1A3D2B]'
                                  : 'bg-white text-[#6B8C6A] border-[#DBCAA8] hover:border-[#1A3D2B]'
                    }`}>
                {icon} {label} ({count})
              </Link>
            )
          })}
        </div>

        {tutorials.length === 0 ? (
          <div className="card p-14 text-center">
            <BookOpen size={40} className="text-[#9AB09A] mx-auto mb-4" />
            <h3 className="font-display font-bold text-[#1A3D2B] text-xl mb-2">Aucun tutoriel</h3>
            <p className="text-[#6B8C6A] text-sm">Des guides seront publiés prochainement.</p>
          </div>
        ) : (
          <>
            {/* Tutoriels mis en avant */}
            {featured.length > 0 && !cat && (
              <section className="mb-10">
                <h2 className="font-display font-bold text-[#1A3D2B] text-xl mb-4 flex items-center gap-2">
                  <Star size={18} className="text-[#D4A820]" /> À la une
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {featured.map(t => {
                    const catInfo = CATEGORIES[t.category] ?? CATEGORIES.general
                    return (
                      <Link key={t.id} href={`/tutoriels/${t.slug}`}>
                        <article className="bg-white border border-[#DBCAA8] rounded-2xl p-6 hover:shadow-md
                                            hover:border-[#D4A820] transition-all group h-full"
                                 style={{ borderTop: `4px solid ${catInfo.color}` }}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">{catInfo.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wide"
                                  style={{ color: catInfo.color }}>{catInfo.label}</span>
                            <span className="ml-auto text-[10px] bg-[#FBF0C8] text-[#A07810] px-2 py-0.5
                                             font-bold rounded-full border border-[rgba(212,168,32,0.3)]">
                              ⭐ À la une
                            </span>
                          </div>
                          <h3 className="font-display font-bold text-lg text-[#1A3D2B] mb-2
                                         group-hover:text-[#2D6A4F] transition-colors">
                            {t.title}
                          </h3>
                          {t.excerpt && (
                            <p className="text-sm text-[#6B8C6A] line-clamp-2 mb-4">{t.excerpt}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-[#9AB09A]">
                            {t.authorName && <span>par {t.authorName}</span>}
                            <span className="flex items-center gap-1"><Eye size={11} /> {t.views}</span>
                            <span className="ml-auto">{formatDate(t.createdAt)}</span>
                          </div>
                        </article>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Grille principale */}
            {regular.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {regular.map(t => {
                  const catInfo = CATEGORIES[t.category] ?? CATEGORIES.general
                  return (
                    <Link key={t.id} href={`/tutoriels/${t.slug}`}>
                      <article className="bg-white border border-[#DBCAA8] rounded-xl p-5 hover:border-[#3A7A52]
                                          hover:shadow-sm transition-all group h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-base">{catInfo.icon}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wide"
                                style={{ color: catInfo.color }}>{catInfo.label}</span>
                        </div>
                        <h3 className="font-display font-bold text-sm text-[#1A3D2B] mb-2 flex-1
                                       group-hover:text-[#2D6A4F] transition-colors line-clamp-2">
                          {t.title}
                        </h3>
                        {t.excerpt && (
                          <p className="text-xs text-[#9AB09A] line-clamp-2 mb-3">{t.excerpt}</p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] text-[#9AB09A] mt-auto pt-3
                                        border-t border-[#DBCAA8]">
                          {t.authorName && <span>par {t.authorName}</span>}
                          <span className="flex items-center gap-1 ml-auto">
                            <Eye size={10} /> {t.views}
                          </span>
                        </div>
                      </article>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
