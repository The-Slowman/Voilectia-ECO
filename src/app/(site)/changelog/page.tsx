import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { ChangelogCard } from '@/components/ui/ChangelogCard'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Historique complet des mises à jour du serveur Voilectia ECO.',
  alternates: { canonical: "/changelog" },
}

export const revalidate = 120

export default async function ChangelogPage({
  searchParams,
}: {
  searchParams: { season?: string; type?: string }
}) {
  const season = searchParams.season
  const type   = searchParams.type

  const changelogs = await prisma.changelog.findMany({
    where: {
      published: true,
      ...(season ? { season } : {}),
      ...(type   ? { type }   : {}),
    },
    orderBy: { publishedAt: 'desc' },
    include: { author: { select: { name: true } } },
  })

  // Get distinct seasons for filter
  const allChangelogs = await prisma.changelog.findMany({
    where:    { published: true },
    select:   { season: true, type: true },
    distinct: ['season'],
  })
  const seasons = [...new Set(allChangelogs.map((c) => c.season))].sort()

  return (
    <div>
      <PageHero
        title="Changelog"
        subtitle="Suivez l'évolution du serveur Voilectia saison après saison."
        badge="🔄 Historique"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href="/changelog"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !season ? 'bg-[#2D6A4F] text-[#E8F5EE]' : 'text-[#2D6A4F] border border-[rgba(82,183,136,0.3)] hover:border-[#52B788] hover:text-[#1A3D2B]'
            }`}
          >
            Toutes les saisons
          </a>
          {seasons.map((s) => (
            <a
              key={s}
              href={`/changelog?season=${s}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                season === s ? 'bg-[#2D6A4F] text-[#E8F5EE]' : 'text-[#2D6A4F] border border-[rgba(82,183,136,0.3)] hover:border-[#52B788] hover:text-[#1A3D2B]'
              }`}
            >
              Saison {s}
            </a>
          ))}
        </div>

        {/* List */}
        {changelogs.length === 0 ? (
          <div className="card p-8 text-center text-[#3D5F4A]">
            Aucune mise à jour trouvée.
          </div>
        ) : (
          <div className="space-y-4">
            {changelogs.map((c) => (
              <ChangelogCard key={c.id} entry={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
