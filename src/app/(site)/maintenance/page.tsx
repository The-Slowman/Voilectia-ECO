import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { CountdownTimer } from '@/components/ui/CountdownTimer'

export const revalidate = 60
export const metadata   = { title: 'Voilectia ECO — Bientôt' }

// Sections accessibles avec leurs labels et URL
const SECTION_MAP: Record<string, { label: string; href: string; icon: string }> = {
  'tutoriels':    { label: 'Tutoriels',           href: '/tutoriels',    icon: '📖' },
  'guides':       { label: 'Guides',              href: '/guides',       icon: '📚' },
  'top-serveur':  { label: 'Voter Top-Serveur',   href: '/vote',         icon: '🏆' },
  'changelog':    { label: 'Changelog',           href: '/changelog',    icon: '🔄' },
  'faq':          { label: 'FAQ',                 href: '/faq',          icon: '❓' },
}

async function getSettings() {
  try {
    const s = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
    return s ?? null
  } catch {
    return null
  }
}

export default async function MaintenancePage() {
  const settings = await getSettings()

  const title      = settings?.maintenanceTitle   ?? 'Saison 2 — Bientôt disponible'
  const message    = settings?.maintenanceMessage ?? 'Le serveur se prépare pour une nouvelle aventure.'
  const launchDate = settings?.launchDate
  const discordUrl = settings?.siteDiscordUrl     ?? process.env.NEXT_PUBLIC_DISCORD_URL ?? '#'
  const allowed    = JSON.parse(settings?.allowedSections ?? '["forum","tutoriels","top-serveur"]') as string[]

  const accessibleSections = allowed
    .map(k => SECTION_MAP[k])
    .filter(Boolean)

  return (
    <div className="relative min-h-screen bg-[#0C1F14] flex flex-col items-center justify-center
                    overflow-hidden px-4 py-16">

      {/* Fond étoilé animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width:     Math.random() * 2.5 + 0.5 + 'px',
              height:    Math.random() * 2.5 + 0.5 + 'px',
              top:       Math.random() * 100 + '%',
              left:      Math.random() * 100 + '%',
              opacity:   Math.random() * 0.5 + 0.1,
              animation: `pulse ${Math.random() * 4 + 2}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + 's',
            }}
          />
        ))}
        {/* Lueur verte */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full
                        bg-[#2D6A4F] opacity-10 blur-[120px]" />
        {/* Lueur or */}
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full
                        bg-[#D4A820] opacity-8 blur-[100px]" />
      </div>

      {/* Ligne or en haut */}
      <div className="absolute top-0 left-0 right-0 h-[2px]
                      bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />

      {/* Contenu */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-10">

        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24 drop-shadow-[0_0_30px_rgba(82,183,136,0.4)]">
            <Image src="/images/logo.png" alt="Voilectia ECO" fill className="object-contain" />
          </div>
        </div>

        {/* Titre */}
        <div>
          <p className="text-[#52B788] text-xs font-bold uppercase tracking-[0.3em] mb-3">
            Voilectia ECO
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-[#F2E8D5] leading-tight mb-4">
            {title}
          </h1>
          <p className="text-[rgba(242,232,213,0.55)] text-base sm:text-lg max-w-lg mx-auto leading-relaxed"
             style={{ fontFamily: 'var(--font-lora)' }}>
            {message}
          </p>
        </div>

        {/* Countdown */}
        {launchDate && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-[rgba(242,232,213,0.35)] text-xs uppercase tracking-widest">
              Lancement dans
            </p>
            <CountdownTimer targetDate={launchDate} />
          </div>
        )}

        {/* Séparateur */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[rgba(212,168,32,0.2)]" />
          <span className="text-[#D4A820] text-lg">⚙</span>
          <div className="flex-1 h-px bg-[rgba(212,168,32,0.2)]" />
        </div>

        {/* Sections accessibles */}
        {accessibleSections.length > 0 && (
          <div>
            <p className="text-[rgba(242,232,213,0.4)] text-xs uppercase tracking-widest mb-4">
              Accessible pendant la maintenance
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {accessibleSections.map(s => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                             bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)]
                             text-[#E8F5EE] hover:bg-[rgba(82,183,136,0.12)] hover:border-[rgba(82,183,136,0.3)]
                             transition-all"
                >
                  <span>{s.icon}</span> {s.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Discord */}
        <a
          href={discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm
                     text-white transition-all group"
          style={{ background: 'linear-gradient(135deg, #5865F2, #4752C4)' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.93 21.19a.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          </svg>
          Rejoindre le Discord
          <ExternalLink size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Pied de page */}
        <p className="text-[rgba(242,232,213,0.2)] text-xs">
          © Voilectia ECO · Tous droits réservés
        </p>
      </div>

      {/* Ligne or en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]
                      bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />
    </div>
  )
}
