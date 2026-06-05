import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { PageHero } from '@/components/ui/PageHero'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { Calendar, MapPin, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Événements',
  description: 'Événements communautaires, concours de construction et animations sur le serveur Voilectia ECO.',
}

export const revalidate = 120

export default async function EvenementsPage() {
  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where:   { published: true, status: { in: ['upcoming', 'ongoing'] } },
      orderBy: { startDate: 'asc' },
    }),
    prisma.event.findMany({
      where:   { published: true, status: 'past' },
      orderBy: { startDate: 'desc' },
      take:    6,
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    }),
  ])

  const EVENT_TYPE_COLORS: Record<string, string> = {
    community: 'badge-green',
    build:     'badge-blue',
    economy:   'badge-gold',
    special:   'badge-red',
  }
  const EVENT_TYPE_LABELS: Record<string, string> = {
    community: 'Communauté',
    build:     'Construction',
    economy:   'Économie',
    special:   'Spécial',
  }

  return (
    <div>
      <PageHero
        title="Événements"
        subtitle="Concours de construction, marchés communautaires, fêtes de saison... La vie de Voilectia ne s'arrête jamais !"
        badge="🎉 Agenda"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* À venir */}
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold text-[#E8F5EE] mb-6 flex items-center gap-3">
            <Calendar className="text-[#52B788]" size={22} />
            Événements à venir
          </h2>
          {upcoming.length === 0 ? (
            <div className="card p-8 text-center text-[#5A8A6A]">
              Aucun événement prévu pour le moment. Restez connectés sur Discord !
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((event) => (
                <Link key={event.id} href={`/evenements/${event.slug}`}>
                  <div className="card-hover p-5 md:p-6 flex items-start gap-5 group">
                    <div className="w-14 h-14 rounded-xl bg-[rgba(82,183,136,0.1)] text-[#52B788] flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-[rgba(82,183,136,0.18)] transition-colors">
                      <span className="font-display font-bold text-xl leading-none">
                        {new Date(event.startDate).getDate()}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide opacity-70">
                        {new Date(event.startDate).toLocaleString('fr-FR', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={EVENT_TYPE_COLORS[event.type] ?? 'badge-green'}>
                          {EVENT_TYPE_LABELS[event.type] ?? event.type}
                        </span>
                        {event.status === 'ongoing' && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#52B788]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#52B788] animate-pulse" />
                            En cours
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-[#E8F5EE] mb-1 group-hover:text-[#52B788] transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-[#9DC4AD] text-sm line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[#5A8A6A]">
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {event.location}
                          </span>
                        )}
                        {event.endDate && (
                          <span>Jusqu'au {formatDate(event.endDate)}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#5A8A6A] group-hover:text-[#52B788] flex-shrink-0 transition-colors mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Événements passés */}
        {past.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold text-[#E8F5EE] mb-6">
              Événements passés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {past.map((event) => {
                const img = event.images[0]?.url
                return (
                  <Link key={event.id} href={`/evenements/${event.slug}`}>
                    <div className="card-hover overflow-hidden group">
                      <div className="relative h-36 bg-[#162B1E]">
                        {img ? (
                          <Image src={img} alt={event.title} fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-20">🎉</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111F18] to-transparent" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-[#E8F5EE] text-sm mb-1 group-hover:text-[#52B788] transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                        <p className="text-[#5A8A6A] text-xs">{formatDate(event.startDate)}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
