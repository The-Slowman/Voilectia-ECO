import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Gift, Trophy, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { GiveawayCard } from '@/components/ui/GiveawayCard'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Giveaways — Voilectia ECO',
  description: 'Participez aux concours et tirages au sort de la communauté Voilectia ECO.',
}

async function getGiveaways() {
  try {
    return await prisma.giveaway.findMany({
      where: { published: true },
      include: { _count: { select: { entries: true } } },
      orderBy: [{ ended: 'asc' }, { endDate: 'asc' }],
    })
  } catch { return [] }
}

export default async function GiveawaysPage() {
  const giveaways = await getGiveaways()
  const now       = new Date()
  const active    = giveaways.filter(g => !g.ended && new Date(g.endDate) > now)
  const past      = giveaways.filter(g => g.ended || new Date(g.endDate) <= now)

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="py-20 bg-forest-texture">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 border border-[rgba(212,168,32,0.35)] bg-[rgba(212,168,32,0.1)] text-[#E8C84A] text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-6">
            🎁 Concours & Cadeaux
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black text-[#F2E8D5] mb-4">
            Giveaways
          </h1>
          <p className="text-[rgba(242,232,213,0.6)] text-base max-w-xl mx-auto leading-relaxed">
            Participez aux concours de la communauté Voilectia et tentez de remporter des récompenses exclusives.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12">

        {/* Giveaways actifs */}
        {active.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold text-[#1A3D2B] mb-6 flex items-center gap-2">
              <Clock size={20} className="text-[#52B788]" /> En cours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {active.map(g => <GiveawayCard key={g.id} giveaway={g} />)}
            </div>
          </section>
        )}

        {/* Aucun giveaway actif */}
        {active.length === 0 && (
          <div className="card p-12 text-center">
            <Gift size={48} className="text-[#DBCAA8] mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-[#1A3D2B] mb-2">
              Aucun giveaway en cours
            </h2>
            <p className="text-[#6B8C6A] max-w-sm mx-auto">
              Rejoignez notre Discord pour être informé des prochains concours et ne rien manquer.
            </p>
            <a href={process.env.NEXT_PUBLIC_DISCORD_URL ?? '#'}
               target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 mt-6 bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Rejoindre Discord
            </a>
          </div>
        )}

        {/* Historique */}
        {past.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold text-[#1A3D2B] mb-6 flex items-center gap-2">
              <Trophy size={20} className="text-[#D4A820]" /> Historique
            </h2>
            <div className="space-y-3">
              {past.map(g => (
                <div key={g.id} className="card p-5 flex items-center gap-4 opacity-75">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(212,168,32,0.1)] flex items-center justify-center flex-shrink-0">
                    <Gift size={18} className="text-[#D4A820]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#1A3D2B] text-sm">{g.title}</div>
                    <div className="text-xs text-[#6B8C6A]">🏆 {g.prize}</div>
                  </div>
                  {g.winnerName ? (
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] text-[#6B8C6A] uppercase tracking-wide">Gagnant</div>
                      <div className="font-bold text-[#D4A820] text-sm">🎉 {g.winnerName}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-[#9AB09A]">Terminé</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
