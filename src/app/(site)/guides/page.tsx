import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'
import { prisma } from '@/lib/db'
import { getGuideCategories } from '@/lib/guide-categories'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Guides debutants, metiers, economie et plus pour le serveur Eco Voilectia.',
  alternates: { canonical: "/guides" },
}

export const revalidate = 300

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const category = searchParams.category

  const [guides, cats] = await Promise.all([
    prisma.guide.findMany({
      where: { published: true, ...(category ? { category } : {}) },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
      include: { author: { select: { name: true } } },
    }),
    getGuideCategories(),
  ])

  const catMap: Record<string, { label: string; icon: string }> = {}
  for (const c of cats) catMap[c.slug] = { label: c.name, icon: c.icon ?? '📄' }
  const info = (slug: string) => catMap[slug] ?? { label: slug, icon: '📄' }

  const grouped = guides.reduce<Record<string, typeof guides>>((acc, g) => {
    if (!acc[g.category]) acc[g.category] = []
    acc[g.category].push(g)
    return acc
  }, {})

  return (
    <div>
      <PageHero
        title="Guides"
        subtitle="Tout ce que vous devez savoir pour jouer sur Voilectia — du debutant au joueur experimente."
        badge="📖 Documentation"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/guides"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !category ? 'bg-[#2D6A4F] text-[#E8F5EE]' : 'text-[#2D6A4F] border border-[rgba(82,183,136,0.3)] hover:border-[#52B788] hover:text-[#1A3D2B]'
            }`}
          >
            Tous les guides
          </Link>
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/guides?category=${c.slug}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === c.slug ? 'bg-[#2D6A4F] text-[#E8F5EE]' : 'text-[#2D6A4F] border border-[rgba(82,183,136,0.3)] hover:border-[#52B788] hover:text-[#1A3D2B]'
              }`}
            >
              {c.icon} {c.name}
            </Link>
          ))}
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="card p-8 text-center text-[#3D5F4A]">
            Aucun guide disponible pour le moment. Revenez bientot !
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(grouped).map(([cat, items]) => {
              const catInfo = info(cat)
              return (
                <section key={cat}>
                  <h2 className="font-display text-xl font-bold text-[#1A3D2B] mb-5 flex items-center gap-3">
                    <span className="text-2xl">{catInfo.icon}</span>
                    {catInfo.label}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((guide) => (
                      <Link key={guide.id} href={`/guides/${guide.slug}`}>
                        <div className="card-hover p-5 flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-lg bg-[rgba(82,183,136,0.1)] text-[#52B788] flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-[rgba(82,183,136,0.18)] transition-colors">
                            {catInfo.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[#1A3D2B] text-sm mb-1 group-hover:text-[#52B788] transition-colors line-clamp-1">
                              {guide.title}
                            </h3>
                            {guide.excerpt && (
                              <p className="text-[#4A6854] text-xs line-clamp-2">{guide.excerpt}</p>
                            )}
                          </div>
                          <ChevronRight size={14} className="text-[#3D5F4A] group-hover:text-[#52B788] flex-shrink-0 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
