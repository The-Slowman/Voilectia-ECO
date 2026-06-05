import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { Heart, Server, Shield, ExternalLink, CheckCircle, XCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Nous soutenir',
  description: 'Soutenez le serveur Voilectia ECO sur Tipeee. Transparence totale, aucun avantage Pay-to-Win.',
}

const EXPENSES = [
  { label: 'Serveur dédié (hébergement)',  amount: 'Variable / mois', icon: <Server size={16} /> },
  { label: 'Nom de domaine',               amount: '~15€ / an',       icon: '🌐' },
  { label: 'Outils & plugins',             amount: 'Ponctuel',        icon: '🔧' },
  { label: 'Développements & mods',        amount: 'Bénévolat',       icon: '💻' },
]

export default function SoutenirPage() {
  return (
    <div>
      <PageHero
        title="Nous soutenir"
        subtitle="Voilectia est un projet communautaire sans but lucratif. Votre soutien aide à maintenir un serveur stable et qualitatif."
        badge="💚 Soutien"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-10">

        {/* Tipeee CTA */}
        <div className="card p-8 text-center border border-[rgba(212,160,23,0.25)]">
          <Heart size={40} className="text-red-400 mx-auto mb-4 fill-red-400" />
          <h2 className="font-display text-2xl font-bold text-[#E8F5EE] mb-3">
            Soutenir sur Tipeee
          </h2>
          <p className="text-[#9DC4AD] text-sm mb-6 leading-relaxed">
            Tipeee est la plateforme de soutien que nous utilisons pour financer les coûts du serveur.
            Chaque contribution, même symbolique, fait une vraie différence.
          </p>
          <a
            href={process.env.NEXT_PUBLIC_TIPEEE_URL || 'https://fr.tipeee.com/voilectia'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold btn-lg inline-flex"
          >
            <Heart size={18} className="fill-current" />
            Soutenir Voilectia
            <ExternalLink size={14} />
          </a>
        </div>

        {/* No P2W */}
        <div className="card p-6 border border-[rgba(82,183,136,0.25)]">
          <h2 className="font-display text-xl font-bold text-[#E8F5EE] mb-5 flex items-center gap-3">
            <Shield className="text-[#52B788]" size={22} />
            Notre engagement : 0% Pay-to-Win
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-[#52B788] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <CheckCircle size={13} /> Ce que vous obtenez
              </p>
              <ul className="space-y-2">
                {[
                  'Nos sincères remerciements 💚',
                  'Un rôle cosmétique Discord',
                  'La satisfaction d\'aider la communauté',
                ].map((item) => (
                  <li key={item} className="text-[#9DC4AD] text-sm flex items-start gap-2">
                    <CheckCircle size={13} className="text-[#52B788] mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <XCircle size={13} /> Ce que vous n'obtenez PAS
              </p>
              <ul className="space-y-2">
                {[
                  'Aucun avantage in-game',
                  'Aucun item ou ressource',
                  'Aucun accès privilégié au serveur',
                ].map((item) => (
                  <li key={item} className="text-[#9DC4AD] text-sm flex items-start gap-2">
                    <XCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Dépenses transparence */}
        <section>
          <h2 className="font-display text-xl font-bold text-[#E8F5EE] mb-5">
            Transparence financière
          </h2>
          <p className="text-[#9DC4AD] text-sm mb-5 leading-relaxed">
            Voici les coûts réels liés au fonctionnement de Voilectia. Nous nous engageons
            à une transparence totale sur l'utilisation des fonds reçus.
          </p>
          <div className="space-y-3">
            {EXPENSES.map((expense) => (
              <div key={expense.label} className="card p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-[rgba(82,183,136,0.08)] text-[#52B788] flex items-center justify-center flex-shrink-0">
                  {typeof expense.icon === 'string' ? (
                    <span>{expense.icon}</span>
                  ) : expense.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[#E8F5EE] text-sm font-medium">{expense.label}</p>
                </div>
                <span className="badge-green text-xs">{expense.amount}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
