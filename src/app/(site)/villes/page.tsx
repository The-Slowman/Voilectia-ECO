import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { PageHero } from '@/components/ui/PageHero'
import { prisma } from '@/lib/db'
import { MapPin, Users, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Villes',
  description: 'Découvrez les villes du serveur Voilectia ECO — leurs maires, projets et constructions.',
}

export const revalidate = 300

export default async function VillesPage() {
  const cities = await prisma.city.findMany({
    where:   { published: true },
    orderBy: { order: 'asc' },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
  })

  return (
    <div>
      <PageHero
        title="Villes"
        subtitle="Les villes sont le cœur de Voilectia — chacune avec son architecture, son ambiance et ses projets uniques."
        badge="🏙️ Carte du monde"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {cities.length === 0 ? (
          <div className="card p-12 text-center">
            <Building2 size={40} className="text-[#5A8A6A] mx-auto mb-4" />
            <h3 className="font-display font-bold text-[#E8F5EE] text-xl mb-2">
              Les villes arrivent bientôt !
            </h3>
            <p className="text-[#9DC4AD] text-sm">
              Les villes du serveur seront présentées ici dès leur création.
              Rejoignez Discord pour être parmi les premiers à fonder votre ville.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => {
              const coverImage = city.images[0]?.url ?? city.coverImage
              return (
                <Link key={city.id} href={`/villes/${city.slug}`}>
                  <article className="card-hover overflow-hidden group h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-48 bg-[#162B1E] overflow-hidden">
                      {coverImage ? (
                        <Image
                          src={coverImage}
                          alt={city.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 size={40} className="text-[rgba(82,183,136,0.2)]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111F18] via-transparent to-transparent" />
                      {city.biome && (
                        <div className="absolute top-3 right-3 badge-green text-[10px]">
                          {city.biome}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h2 className="font-display font-bold text-lg text-[#E8F5EE] mb-1 group-hover:text-[#52B788] transition-colors">
                        {city.name}
                      </h2>
                      <div className="flex items-center gap-4 text-xs text-[#5A8A6A] mb-3">
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          Maire : <span className="text-[#9DC4AD] ml-1">{city.mayor}</span>
                        </span>
                        {city.population && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {city.population} hab.
                          </span>
                        )}
                      </div>
                      <p className="text-[#9DC4AD] text-sm leading-relaxed line-clamp-3 flex-1">
                        {city.description}
                      </p>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
