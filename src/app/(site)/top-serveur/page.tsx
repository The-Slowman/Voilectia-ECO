'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Trophy, Star, Users, Heart, ExternalLink, Award, ChevronRight, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const TOP_SERVEUR_URL   = 'https://www.top-serveur.fr/eco/voilectia'
const SERVEUR_PRIVE_URL = 'https://www.serveur-prive.net'

function getVoterToken(): string {
  if (typeof window === 'undefined') return ''
  let t = localStorage.getItem('vlc_ts_token')
  if (!t) { t = crypto.randomUUID(); localStorage.setItem('vlc_ts_token', t) }
  return t
}

export default function TopServeurPage() {
  const [hasVotedToday, setHasVotedToday] = useState(false)
  const [totalVotes,    setTotalVotes]    = useState<number | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [countdown,     setCountdown]     = useState('')

  useEffect(() => {
    // Vérifier si vote déjà effectué aujourd'hui
    const lastVote = localStorage.getItem('vlc_last_vote_date')
    const today    = new Date().toDateString()
    if (lastVote === today) setHasVotedToday(true)

    // Compte à rebours vers minuit
    const tick = () => {
      const now      = new Date()
      const midnight = new Date(now); midnight.setHours(24, 0, 0, 0)
      const diff     = midnight.getTime() - now.getTime()
      const h  = Math.floor(diff / 3600000)
      const m  = Math.floor((diff % 3600000) / 60000)
      const s  = Math.floor((diff % 60000) / 1000)
      setCountdown(`${h}h ${m.toString().padStart(2,'0')}m ${s.toString().padStart(2,'0')}s`)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  async function handleVote() {
    setLoading(true)
    try {
      // Ouvrir top-serveur dans un nouvel onglet
      window.open(TOP_SERVEUR_URL, '_blank', 'noopener')

      // Enregistrer le vote côté serveur
      await fetch('/api/top-serveur/vote', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: getVoterToken() }),
      }).catch(() => {})

      // Marquer comme voté aujourd'hui
      localStorage.setItem('vlc_last_vote_date', new Date().toDateString())
      setHasVotedToday(true)
      toast.success('Merci pour votre vote ! 💚')
    } finally {
      setLoading(false)
    }
  }

  const AVANTAGES = [
    { emoji: '🌿', title: 'Communauté grandissante', desc: 'Chaque vote nous aide à attirer de nouveaux joueurs qui partagent nos valeurs.' },
    { emoji: '🏗️', title: 'Plus de bâtisseurs',      desc: 'Une communauté plus large = plus de projets de construction ambitieux.' },
    { emoji: '💰', title: 'Économie plus riche',      desc: 'Plus de joueurs actifs = une économie VLC plus dynamique et diversifiée.' },
    { emoji: '🎉', title: 'Plus d\'événements',       desc: 'La popularité du serveur nous permet d\'organiser de meilleurs événements.' },
  ]

  return (
    <div className="bg-[#F2E8D5] min-h-screen">

      {/* Hero */}
      <div className="relative bg-[#1A3D2B] pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0"
             style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,168,32,0.15) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-[3px]
                        bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full
                          border border-[rgba(212,168,32,0.35)] bg-[rgba(212,168,32,0.1)]
                          text-[#E8C84A] text-xs font-semibold tracking-wider uppercase">
            <Trophy size={13} /> Classement des serveurs
          </div>

          <h1 className="font-display font-black text-5xl md:text-6xl text-[#F2E8D5] mb-4">
            Top-Serveur
          </h1>
          <p className="text-[rgba(242,232,213,0.55)] text-base max-w-lg mx-auto mb-8 leading-relaxed italic"
             style={{ fontFamily: 'var(--font-lora)' }}>
            Aidez Voilectia à se hisser dans les classements en votant chaque jour.
            C'est gratuit et ne prend que 10 secondes !
          </p>

          {/* Vote button principal */}
          {hasVotedToday ? (
            <div className="inline-flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 bg-[rgba(58,122,82,0.2)] border border-[rgba(58,122,82,0.4)]
                              text-[#74C69D] px-8 py-4 rounded-xl font-bold text-lg">
                <Star size={22} className="fill-current" />
                Déjà voté aujourd'hui — Merci ! 💚
              </div>
              <p className="text-[rgba(242,232,213,0.4)] text-sm">
                Prochain vote disponible dans <span className="text-[#E8C84A] font-mono font-bold">{countdown}</span>
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleVote}
                disabled={loading}
                className="inline-flex items-center gap-3 bg-[#D4A820] hover:bg-[#E8C84A]
                           text-[#1A3D2B] font-black px-10 py-5 rounded-2xl text-xl
                           transition-all hover:scale-105 disabled:opacity-70
                           shadow-[0_8px_32px_rgba(212,168,32,0.4)]"
              >
                {loading ? (
                  <span className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trophy size={26} />
                )}
                Voter pour Voilectia !
                <ExternalLink size={16} />
              </button>
              <p className="text-[rgba(242,232,213,0.35)] text-xs">
                Un vote par jour sur top-serveur.fr · Gratuit · Sans inscription
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#E8D9BF] border-b border-[#DBCAA8] py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-3 gap-6 text-center">
          {[
            { label: 'Votes ce mois', value: '—',   icon: <Trophy size={20} />,  note: 'mis à jour quotidiennement' },
            { label: 'Classement',   value: '#?',   icon: <Award size={20} />,   note: 'top-serveur.fr' },
            { label: 'Votants actifs', value: '—',  icon: <Users size={20} />,   note: 'votent régulièrement' },
          ].map((s) => (
            <div key={s.label} className="group">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl
                              bg-white border border-[#DBCAA8] text-[#1A3D2B] mb-3
                              group-hover:border-[#D4A820] group-hover:text-[#D4A820] transition-colors">
                {s.icon}
              </div>
              <div className="font-display font-bold text-2xl text-[#1A3D2B] mb-0.5">{s.value}</div>
              <div className="text-xs text-[#6B8C6A] font-semibold">{s.label}</div>
              <div className="text-[10px] text-[#9AB09A] italic">{s.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pb-20 space-y-12">

        {/* Pourquoi voter */}
        <section>
          <h2 className="font-display font-bold text-[#1A3D2B] text-2xl mb-2">
            Pourquoi voter ?
          </h2>
          <p className="text-[#6B8C6A] text-sm mb-6 italic" style={{ fontFamily: 'var(--font-lora)' }}>
            Un vote prend 10 secondes et a un impact réel sur la communauté.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AVANTAGES.map((a) => (
              <div key={a.title}
                   className="bg-white border border-[#DBCAA8] rounded-xl p-5 flex gap-4
                              hover:border-[#D4A820] transition-all group">
                <span className="text-2xl">{a.emoji}</span>
                <div>
                  <h3 className="font-semibold text-[#1A3D2B] text-sm mb-1">{a.title}</h3>
                  <p className="text-[#6B8C6A] text-xs leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Guide de vote */}
        <section>
          <h2 className="font-display font-bold text-[#1A3D2B] text-2xl mb-6">
            Comment voter ?
          </h2>
          <div className="space-y-3">
            {[
              { num: '01', title: 'Cliquez sur "Voter pour Voilectia"',  desc: 'Le bouton s\'ouvre sur top-serveur.fr dans un nouvel onglet.' },
              { num: '02', title: 'Complétez le captcha anti-robot',      desc: 'Simple vérification pour s\'assurer que vous êtes un humain.' },
              { num: '03', title: 'Confirmez votre vote',                 desc: 'Votre vote est pris en compte instantanément.' },
              { num: '04', title: 'Revenez demain !',                    desc: 'On peut voter une fois toutes les 24h — chaque vote compte.' },
            ].map((step) => (
              <div key={step.num}
                   className="bg-white border border-[#DBCAA8] rounded-xl p-5 flex gap-5 items-start">
                <div className="font-display font-black text-3xl text-[rgba(212,168,32,0.25)] flex-shrink-0 w-10">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A3D2B] text-sm mb-1">{step.title}</h3>
                  <p className="text-[#6B8C6A] text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Autres plateformes */}
        <section>
          <h2 className="font-display font-bold text-[#1A3D2B] text-xl mb-4">
            Nous retrouver ailleurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href={TOP_SERVEUR_URL} target="_blank" rel="noopener noreferrer"
               className="bg-white border border-[#DBCAA8] rounded-xl p-5 flex items-center gap-4
                          hover:border-[#D4A820] hover:shadow-sm transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#FBF0C8] border border-[rgba(212,168,32,0.3)]
                              flex items-center justify-center text-2xl flex-shrink-0">
                🏆
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#1A3D2B] text-sm">Top-Serveur.fr</div>
                <div className="text-xs text-[#6B8C6A]">Vote quotidien — 1 vote / 24h</div>
              </div>
              <ExternalLink size={14} className="text-[#9AB09A] group-hover:text-[#D4A820] transition-colors" />
            </a>

            <a href={process.env.NEXT_PUBLIC_DISCORD_URL ?? '#'} target="_blank" rel="noopener noreferrer"
               className="bg-white border border-[#DBCAA8] rounded-xl p-5 flex items-center gap-4
                          hover:border-[#5865F2] hover:shadow-sm transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[rgba(88,101,242,0.08)] border border-[rgba(88,101,242,0.2)]
                              flex items-center justify-center text-2xl flex-shrink-0">
                💬
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#1A3D2B] text-sm">Discord Voilectia</div>
                <div className="text-xs text-[#6B8C6A]">Rejoignez la communauté</div>
              </div>
              <ExternalLink size={14} className="text-[#9AB09A] group-hover:text-[#5865F2] transition-colors" />
            </a>
          </div>
        </section>

        {/* CTA final */}
        {!hasVotedToday && (
          <div className="bg-[#1A3D2B] rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0"
                 style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,168,32,0.12) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <p className="text-[rgba(242,232,213,0.6)] text-sm mb-4 italic"
                 style={{ fontFamily: 'var(--font-lora)' }}>
                Vous n'avez pas encore voté aujourd'hui !
              </p>
              <button
                onClick={handleVote}
                className="inline-flex items-center gap-3 bg-[#D4A820] hover:bg-[#E8C84A]
                           text-[#1A3D2B] font-bold px-8 py-4 rounded-xl text-base
                           transition-all hover:scale-105 shadow-[0_4px_20px_rgba(212,168,32,0.35)]"
              >
                <Trophy size={20} /> Voter maintenant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
