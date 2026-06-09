import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Server, Globe, Zap, Users, Coins, Calendar, Cpu } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'Configuration du serveur — Voilectia ECO',
  description: 'Découvrez la configuration technique et les paramètres du serveur Eco Voilectia.',
  alternates: { canonical: '/configuration' },
}

async function getServerConfig() {
  try {
    let config = await prisma.serverConfig.findUnique({
      where: { id: 'singleton' },
      include: { progressions: { orderBy: { order: 'asc' } } },
    })
    if (!config) {
      config = await prisma.serverConfig.create({
        data: { id: 'singleton' },
        include: { progressions: { orderBy: { order: 'asc' } } },
      })
    }
    return config
  } catch {
    return null
  }
}

export default async function ServeurPage() {
  const config = await getServerConfig()

  const SPECS = config ? [
    { icon: <Globe size={20} />,   label: 'Taille du monde',     value: config.worldSize,   color: 'text-[#4A9EC4]' },
    { icon: <Zap size={20} />,     label: 'Difficulté',          value: config.difficulty,  color: 'text-orange-400' },
    { icon: <Cpu size={20} />,     label: "Taux d'XP",           value: config.xpRate,      color: 'text-purple-400' },
    { icon: <Users size={20} />,   label: 'Spécialités / joueur', value: `${config.specialties}`, color: 'text-[#52B788]' },
    { icon: <Coins size={20} />,   label: 'Monnaie',             value: config.currency,    color: 'text-[#D4A820]' },
    { icon: <Calendar size={20} />, label: 'Saison',             value: config.season,      color: 'text-pink-400' },
  ] : []

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="py-20 bg-forest-texture">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 border border-[rgba(82,183,136,0.3)] bg-[rgba(82,183,136,0.1)] text-[#52B788] text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-6">
            🖥️ Serveur
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black text-[#F2E8D5] mb-4">
            Configuration
          </h1>
          <p className="text-[rgba(242,232,213,0.6)] text-base max-w-xl mx-auto leading-relaxed">
            Tous les paramètres techniques et règles du serveur Voilectia ECO.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12">

        {/* Specs */}
        {config && (
          <section>
            <h2 className="font-display text-2xl font-bold text-[#1A3D2B] mb-6 flex items-center gap-2">
              <Server size={20} /> Paramètres de jeu
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SPECS.map((spec) => (
                <div key={spec.label} className="card p-6 text-center group">
                  <div className={`flex justify-center mb-3 ${spec.color} group-hover:scale-110 transition-transform`}>
                    {spec.icon}
                  </div>
                  <div className="font-display font-bold text-2xl text-[#1A3D2B] mb-1">{spec.value}</div>
                  <div className="text-xs text-[#6B8C6A] uppercase tracking-wide">{spec.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Connexion */}
        {config?.serverIp && (
          <section className="card p-8">
            <h2 className="font-display text-xl font-bold text-[#1A3D2B] mb-4 flex items-center gap-2">
              🔗 Se connecter
            </h2>
            <div className="bg-[#F2E8D5] border border-[#DBCAA8] rounded-xl p-4 inline-flex items-center gap-3">
              <span className="text-[#6B8C6A] text-sm">IP :</span>
              <code className="font-mono font-bold text-[#1A3D2B] text-lg">
                {config.serverIp}{config.serverPort ? `:${config.serverPort}` : ''}
              </code>
            </div>
            {config.maxPlayers && (
              <p className="text-sm text-[#6B8C6A] mt-3 flex items-center gap-1.5">
                <Users size={14} /> Capacité : {config.maxPlayers} joueurs maximum
              </p>
            )}
          </section>
        )}

        {/* Description */}
        {config?.description && (
          <section className="card p-8">
            <h2 className="font-display text-xl font-bold text-[#1A3D2B] mb-4">À propos du serveur</h2>
            <p className="text-[#2D5A3F] leading-relaxed whitespace-pre-wrap">{config.description}</p>
          </section>
        )}

        {/* Dates */}
        {(config?.startDate || config?.endDate) && (
          <section className="card p-8">
            <h2 className="font-display text-xl font-bold text-[#1A3D2B] mb-4 flex items-center gap-2">
              <Calendar size={18} /> Dates de la saison
            </h2>
            <div className="flex gap-8">
              {config.startDate && (
                <div>
                  <div className="text-xs text-[#6B8C6A] uppercase tracking-wide mb-1">Début</div>
                  <div className="font-bold text-[#1A3D2B]">
                    {new Date(config.startDate).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
                  </div>
                </div>
              )}
              {config.endDate && (
                <div>
                  <div className="text-xs text-[#6B8C6A] uppercase tracking-wide mb-1">Fin estimée</div>
                  <div className="font-bold text-[#1A3D2B]">
                    {new Date(config.endDate).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link href="/progression" className="btn-primary mr-4">Voir la progression des métiers</Link>
          <Link href="/presentation" className="btn-outline">Présentation du serveur</Link>
        </div>
      </div>
    </div>
  )
}
