import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { prisma } from '@/lib/db'
import { RULE_SEVERITY } from '@/lib/utils'
import { AlertTriangle, Info, XCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Règlement',
  description: 'Règlement officiel du serveur Voilectia ECO. Lisez et respectez les règles pour une communauté saine.',
}

export const revalidate = 300

const SEVERITY_ICONS = {
  info:    <Info size={14} />,
  warning: <AlertTriangle size={14} />,
  danger:  <XCircle size={14} />,
}

export default async function ReglementPage() {
  const categories = await prisma.ruleCategory.findMany({
    orderBy: { order: 'asc' },
    include: { rules: { orderBy: { order: 'asc' } } },
  })

  return (
    <div>
      <PageHero
        title="Règlement"
        subtitle="En jouant sur Voilectia, vous acceptez l'ensemble des règles ci-dessous. Leur respect garantit une expérience de jeu saine et agréable pour tous."
        badge="📜 Règlement officiel"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Note introductive */}
        <div className="card p-5 mb-10 flex gap-4 border-l-4 border-[#52B788]">
          <Info size={20} className="text-[#52B788] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#E8F5EE] mb-1">Remarque importante</p>
            <p className="text-[#9DC4AD] text-sm leading-relaxed">
              Ce règlement peut être mis à jour à tout moment. La version en ligne fait foi.
              Les sanctions sont appliquées à la discrétion du staff en fonction de la gravité et du contexte.
              En cas de doute, ouvrez un ticket sur Discord.
            </p>
          </div>
        </div>

        {/* Légende */}
        <div className="flex flex-wrap gap-3 mb-8">
          {Object.entries(RULE_SEVERITY).map(([key, val]) => (
            <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${val.bg} ${val.color}`}>
              {SEVERITY_ICONS[key as keyof typeof SEVERITY_ICONS]}
              {val.label}
            </div>
          ))}
        </div>

        {/* Categories */}
        {categories.length === 0 ? (
          <div className="card p-8 text-center text-[#5A8A6A]">
            Le règlement sera publié prochainement.
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map((cat, catIndex) => (
              <section key={cat.id}>
                <h2 className="font-display text-xl font-bold text-[#E8F5EE] mb-5 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[rgba(82,183,136,0.1)] text-[#52B788] flex items-center justify-center text-sm font-mono font-bold flex-shrink-0">
                    {catIndex + 1}
                  </span>
                  {cat.name}
                </h2>
                <div className="space-y-3">
                  {cat.rules.map((rule, ruleIndex) => {
                    const sev = RULE_SEVERITY[rule.severity] ?? RULE_SEVERITY.info
                    return (
                      <div key={rule.id} className={`rounded-xl border p-5 ${sev.bg}`}>
                        <div className="flex items-start gap-3">
                          <div className={`flex items-center gap-1.5 text-xs font-semibold ${sev.color} flex-shrink-0 mt-0.5`}>
                            {SEVERITY_ICONS[rule.severity as keyof typeof SEVERITY_ICONS]}
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold text-sm mb-1.5 ${sev.color}`}>
                              {catIndex + 1}.{ruleIndex + 1} — {rule.title}
                            </p>
                            <p className="text-[#9DC4AD] text-sm leading-relaxed">{rule.content}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 card p-6 text-center">
          <p className="text-[#9DC4AD] text-sm mb-3">
            Une question sur le règlement ? L'équipe staff est disponible sur Discord.
          </p>
          <a
            href={process.env.NEXT_PUBLIC_DISCORD_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-discord inline-flex text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.93 21.19a.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Ouvrir un ticket Discord
          </a>
        </div>
      </div>
    </div>
  )
}
