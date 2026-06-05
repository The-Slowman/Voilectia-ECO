import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Users, Coins, Building2, Shield, ArrowRight, ExternalLink,
  Calendar, ChevronRight, Leaf, Globe, Hammer, Star
} from 'lucide-react'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { ChangelogCard } from '@/components/ui/ChangelogCard'

export const metadata: Metadata = {
  title: 'Voilectia ECO — Serveur Semi-RP Chill Français',
  description: 'Rejoignez Voilectia, serveur Eco Semi-RP Chill français — Économie VLC, villes vivantes, coopération et constructions. Communauté mature et bienveillante.',
}

export const revalidate = 60

async function getHomeData() {
  const [articles, changelogs, events] = await Promise.all([
    prisma.article.findMany({
      where:   { published: true },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take:    3,
      include: { author: { select: { name: true } } },
    }),
    prisma.changelog.findMany({
      where:   { published: true },
      orderBy: { publishedAt: 'desc' },
      take:    3,
      include: { author: { select: { name: true } } },
    }),
    prisma.event.findMany({
      where:   { published: true, status: { in: ['upcoming', 'ongoing'] } },
      orderBy: { startDate: 'asc' },
      take:    3,
    }),
  ])
  return { articles, changelogs, events }
}

const SERVER_VALUES = [
  { icon: <Globe size={22} />,     title: 'Semi-RP Chill',    desc: 'Un RP centré sur les constructions et l\'architecture, sans obligation de jeu vocal ou textuel.' },
  { icon: <Coins size={22} />,     title: 'Monnaie VLC',      desc: 'Une économie équilibrée avec la monnaie unique VLC et le système EcoGnome.' },
  { icon: <Building2 size={22} />, title: 'Villes vivantes',  desc: 'Des villes dirigées par des maires élus avec des projets architecturaux ambitieux.' },
  { icon: <Shield size={22} />,    title: 'La Fédération',    desc: 'Un gouvernement central qui assure les subventions, règlements et entraide.' },
  { icon: <Users size={22} />,     title: 'Communauté',       desc: 'Une communauté mature, bienveillante et multiculturelle francophone.' },
  { icon: <Hammer size={22} />,    title: 'Métiers variés',   desc: 'Des dizaines de métiers spécialisés pour une progression naturelle et équilibrée.' },
]

export default async function HomePage() {
  const { articles, changelogs, events } = await getHomeData()

  return (
    <div>

      {/* ══════════════════════════════════════════════════════
          HERO — fond vert forêt profond (couleur logo)
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-forest-texture">

        {/* Ligne or en bas du hero */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />

        {/* Grille décorative subtile */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(242,232,213,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(242,232,213,0.6) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />

        {/* Feuilles décoratives */}
        <div className="absolute top-24 left-8 opacity-[0.12] animate-float" style={{ animationDelay: '0s' }}>
          <Leaf size={44} className="text-[#52B878]" />
        </div>
        <div className="absolute bottom-36 right-12 opacity-[0.10] animate-float" style={{ animationDelay: '2s' }}>
          <Leaf size={30} className="text-[#3A7A52]" />
        </div>
        <div className="absolute top-1/2 right-1/4 opacity-[0.06] animate-float" style={{ animationDelay: '4s' }}>
          <Leaf size={64} className="text-[#52B878]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">

          {/* Badge saison */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full
                          border border-[rgba(212,168,32,0.35)] bg-[rgba(212,168,32,0.1)]
                          text-[#E8C84A] text-xs font-semibold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-[#E8C84A] animate-pulse" />
            Serveur Eco Semi-RP Chill — Saison 1
          </div>

          {/* Logo animé */}
          <div className="flex justify-center mb-8">
            <div className="relative w-36 h-36 md:w-44 md:h-44 animate-float
                            drop-shadow-[0_8px_32px_rgba(212,168,32,0.25)]">
              <Image
                src="/images/logo.png"
                alt="Voilectia ECO"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Titre */}
          <h1 className="font-display text-6xl md:text-8xl font-black text-[#F2E8D5]
                         mb-3 tracking-[0.04em]
                         drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)]">
            VOILECTIA
          </h1>

          {/* Badge ECO — identique au logo */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="h-px w-12 bg-[#D4A820] mr-3" />
            <div className="bg-[#1A3D2B] border-2 border-[#D4A820] text-[#F2E8D5]
                            px-6 py-1.5 rounded font-display font-black text-lg
                            tracking-[0.4em] shadow-[0_4px_16px_rgba(212,168,32,0.3)]">
              ECO
            </div>
            <div className="h-px w-12 bg-[#D4A820] ml-3" />
          </div>

          {/* Valeurs — reprend la ligne du logo */}
          <p className="text-[rgba(242,232,213,0.7)] text-sm font-semibold tracking-[0.15em] mb-4 uppercase">
            Économie &nbsp;•&nbsp; Partage &nbsp;•&nbsp; Entraide &nbsp;•&nbsp; Solidarité
          </p>

          <p className="text-[rgba(242,232,213,0.5)] text-base max-w-xl mx-auto mb-10 leading-relaxed
                        font-[var(--font-lora)] italic">
            Rejoignez une communauté mature et bienveillante dans un serveur Eco français,
            axé sur la coopération, les constructions cohérentes et l'économie équilibrée.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={process.env.NEXT_PUBLIC_DISCORD_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#5865F2] hover:bg-[#4752C4]
                         text-white font-bold px-8 py-4 rounded-xl text-base
                         transition-all hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.93 21.19a.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Rejoindre Discord
            </a>
            <Link
              href="/presentation"
              className="inline-flex items-center gap-2 bg-[#D4A820] hover:bg-[#E8C84A]
                         text-[#1A3D2B] font-bold px-8 py-4 rounded-xl text-base
                         transition-all hover:scale-105 shadow-[0_4px_20px_rgba(212,168,32,0.35)]"
            >
              Découvrir le serveur
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Indicateur scroll */}
          <div className="mt-14 flex flex-col items-center gap-2 text-[rgba(242,232,213,0.3)]">
            <span className="text-[10px] tracking-[0.2em] uppercase">Découvrir</span>
            <div className="w-px h-8 bg-gradient-to-b from-[#D4A820] to-transparent" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS — fond crème foncé (transition douce)
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 bg-[#E8D9BF] border-b border-[#DBCAA8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {[
              { label: 'Saison actuelle', value: 'S1',        icon: <Star size={20} /> },
              { label: 'Monnaie',         value: 'VLC',       icon: <Coins size={20} /> },
              { label: 'Gouvernance',     value: 'Fédération',icon: <Shield size={20} /> },
              { label: 'Économie',        value: 'EcoGnome',  icon: <Building2 size={20} /> },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl
                                bg-white border border-[#DBCAA8] text-[#1A3D2B]
                                mb-3 group-hover:border-[#D4A820] group-hover:text-[#D4A820]
                                transition-colors mx-auto shadow-sm">
                  {stat.icon}
                </div>
                <div className="font-display font-bold text-2xl md:text-3xl text-[#1A3D2B] mb-1">
                  {stat.value}
                </div>
                <div className="text-[10px] text-[#6B8C6A] uppercase tracking-[0.12em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          VALEURS — fond crème principal
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-cream-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 badge-green mb-4 text-xs uppercase tracking-wider">
              🌿 Notre philosophie
            </div>
            <h2 className="section-title mb-3">Ce qui fait Voilectia</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Un serveur pensé pour une expérience de jeu enrichissante, équilibrée et respectueuse de tous.
            </p>
            <div className="divider-gold mt-6" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVER_VALUES.map((val, i) => (
              <div key={i} className="card p-6 group cursor-default">
                <div className="w-12 h-12 rounded-xl bg-[#F2E8D5] border border-[#DBCAA8]
                                text-[#1A3D2B] flex items-center justify-center mb-4
                                group-hover:border-[#D4A820] group-hover:text-[#D4A820]
                                transition-all group-hover:shadow-[var(--shadow-gold)]">
                  {val.icon}
                </div>
                <h3 className="font-display font-bold text-[#1A3D2B] text-lg mb-2">{val.title}</h3>
                <p className="text-[#6B8C6A] text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/presentation" className="btn-outline">
              En savoir plus sur Voilectia
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ACTUALITÉS — fond crème alternée
      ══════════════════════════════════════════════════════ */}
      {articles.length > 0 && (
        <section className="py-20 bg-[#E8D9BF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 badge-green mb-3">Dernières nouvelles</div>
                <h2 className="section-title">Actualités</h2>
              </div>
              <Link href="/actualites" className="btn-ghost text-sm hidden sm:flex">
                Toutes les actus <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          CHANGELOG + ÉVÉNEMENTS
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-cream-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Changelog */}
            <div>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="inline-flex badge-green mb-3">Mises à jour</div>
                  <h2 className="font-display text-2xl font-bold text-[#1A3D2B]">Changelog</h2>
                </div>
                <Link href="/changelog" className="btn-ghost text-sm">
                  Tout voir <ChevronRight size={16} />
                </Link>
              </div>
              <div className="space-y-4">
                {changelogs.length > 0 ? (
                  changelogs.map((c) => <ChangelogCard key={c.id} entry={c} compact />)
                ) : (
                  <div className="card p-6 text-center text-[#6B8C6A]">
                    Aucune mise à jour pour le moment
                  </div>
                )}
              </div>
            </div>

            {/* Événements */}
            <div>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="inline-flex badge-gold mb-3">À venir</div>
                  <h2 className="font-display text-2xl font-bold text-[#1A3D2B]">Événements</h2>
                </div>
                <Link href="/evenements" className="btn-ghost text-sm">
                  Tout voir <ChevronRight size={16} />
                </Link>
              </div>
              <div className="space-y-4">
                {events.length > 0 ? (
                  events.map((event) => (
                    <Link key={event.id} href={`/evenements/${event.slug}`}>
                      <div className="card-hover p-5 flex items-start gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-[#F2E8D5] border border-[#DBCAA8]
                                        text-[#1A3D2B] flex items-center justify-center flex-shrink-0
                                        group-hover:border-[#D4A820] group-hover:text-[#D4A820] transition-all">
                          <Calendar size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              event.status === 'ongoing'
                                ? 'bg-[rgba(58,122,82,0.1)] text-[#2D6A4F] border border-[rgba(58,122,82,0.2)]'
                                : 'bg-[var(--gold-pale)] text-[#A07810] border border-[rgba(212,168,32,0.3)]'
                            }`}>
                              {event.status === 'ongoing' ? '🟢 En cours' : '⏰ À venir'}
                            </span>
                          </div>
                          <h3 className="font-semibold text-[#1A3D2B] text-sm group-hover:text-[#2D6A4F]
                                         transition-colors line-clamp-1">
                            {event.title}
                          </h3>
                          <p className="text-[#6B8C6A] text-xs mt-1">
                            {formatDate(event.startDate)}
                            {event.location && ` · ${event.location}`}
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-[#9AB09A] group-hover:text-[#1A3D2B] mt-1
                                                           flex-shrink-0 transition-colors" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="card p-6 text-center text-[#6B8C6A]">
                    Aucun événement prévu pour le moment
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA DISCORD — fond vert forêt (signature Voilectia)
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden bg-forest-texture">
        {/* Ligne or en haut */}
        <div className="absolute top-0 left-0 right-0 h-[3px]
                        bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-5xl mb-6">🌿</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#F2E8D5] mb-4">
            Prêt à rejoindre l'aventure ?
          </h2>
          <p className="text-[rgba(242,232,213,0.55)] text-base mb-8 leading-relaxed italic"
             style={{ fontFamily: 'var(--font-lora)' }}>
            La communauté Voilectia vous accueille ! Rejoignez notre Discord pour toutes les informations
            et commencez votre aventure sur le serveur.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={process.env.NEXT_PUBLIC_DISCORD_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#5865F2] hover:bg-[#4752C4]
                         text-white font-bold px-8 py-4 rounded-xl text-base
                         transition-all hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.93 21.19a.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Rejoindre le Discord
              <ExternalLink size={14} />
            </a>
            <Link
              href="/guides"
              className="inline-flex items-center gap-2 border-2 border-[#D4A820] text-[#D4A820]
                         hover:bg-[#D4A820] hover:text-[#1A3D2B]
                         font-bold px-8 py-4 rounded-xl text-base transition-all hover:scale-105"
            >
              Lire les guides
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
