import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { TrendingUp, Clock, Unlock } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'Progression des métiers — Voilectia ECO',
  description: 'Découvrez le calendrier de déblocage des métiers et spécialités sur le serveur Voilectia ECO.',
}

async function getProgressions() {
  try {
    await prisma.serverConfig.upsert({
      where: { id: 'singleton' }, create: { id: 'singleton' }, update: {},
    })
    return await prisma.jobProgression.findMany({
      where: { configId: 'singleton' },
      orderBy: [{ unlockDay: 'asc' }, { order: 'asc' }],
    })
  } catch { return [] }
}

export default async function ProgressionPage() {
  const progressions = await getProgressions()

  // Grouper par jour
  const byDay = progressions.reduce<Record<number, typeof progressions>>((acc, p) => {
    if (!acc[p.unlockDay]) acc[p.unlockDay] = []
    acc[p.unlockDay].push(p)
    return acc
  }, {})

  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b)

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="py-20 bg-forest-texture">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 border border-[rgba(212,168,32,0.35)] bg-[rgba(212,168,32,0.1)] text-[#E8C84A] text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-6">
            📅 Calendrier de saison
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black text-[#F2E8D5] mb-4">
            Progression
          </h1>
          <p className="text-[rgba(242,232,213,0.6)] text-base max-w-2xl mx-auto leading-relaxed">
            Chaque métier se débloque à un jour précis de la saison. Planifiez votre progression et
            coordonnez-vous avec la communauté pour optimiser l'économie du serveur.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">

        {progressions.length === 0 ? (
          <div className="card p-12 text-center">
            <TrendingUp size={40} className="text-[#9AB09A] mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-[#1A3D2B] mb-2">
              Calendrier en cours de configuration
            </h2>
            <p className="text-[#6B8C6A]">Les administrateurs mettront bientôt à jour la progression des métiers.</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Légende */}
            <div className="card p-4 flex items-center gap-4 text-sm text-[#6B8C6A]">
              <Clock size={16} className="text-[#D4A820] flex-shrink-0" />
              <p>
                Les métiers sont progressivement débloqués au fil des jours de la saison.
                Le <strong className="text-[#1A3D2B]">Jour 1</strong> correspond au premier jour depuis le lancement du serveur.
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-[#DBCAA8]" />

              <div className="space-y-6">
                {days.map((day, i) => (
                  <div key={day} className="relative flex gap-6">
                    {/* Dot */}
                    <div className="flex-shrink-0 w-12 flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-[#D4A820] border-4 border-[#F2E8D5] shadow-sm z-10 mt-1" />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-display font-bold text-[#1A3D2B] text-lg">
                          Jour {day}
                        </span>
                        {i === 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(82,183,136,0.1)] text-[#3A7A52] border border-[rgba(58,122,82,0.2)]">
                            Dès le lancement
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {byDay[day].map(prog => (
                          <div key={prog.id} className="card p-4 flex items-center gap-3 group">
                            {prog.icon && (
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                   style={{ background: `${prog.color}15`, border: `1px solid ${prog.color}30` }}>
                                {prog.icon}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-[#1A3D2B] text-sm flex items-center gap-1.5">
                                <Unlock size={12} style={{ color: prog.color }} />
                                {prog.jobName}
                              </div>
                              {prog.description && (
                                <p className="text-xs text-[#6B8C6A] mt-0.5 truncate">{prog.description}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-display font-bold text-lg" style={{ color: prog.color }}>J{day}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/serveur" className="btn-outline mr-4">Configuration du serveur</Link>
          <Link href="/guides" className="btn-primary">Guides de démarrage</Link>
        </div>
      </div>
    </div>
  )
}
