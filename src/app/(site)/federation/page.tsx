import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { Shield, Coins, Scale, FileText, Users, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Fédération',
  description: 'La Fédération — gouvernement central du serveur Voilectia ECO. Subventions, règlements et entraide.',
}

export default function FederationPage() {
  return (
    <div>
      <PageHero
        title="La Fédération"
        subtitle="Le gouvernement central de Voilectia — garant de l'équilibre, de l'entraide et du développement de la communauté."
        badge="🏛️ Gouvernance"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-14">

        {/* Présentation */}
        <section className="card p-8 border-l-4 border-[#52B788]">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-xl bg-[rgba(82,183,136,0.1)] text-[#52B788] flex items-center justify-center flex-shrink-0">
              <Shield size={28} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-[#E8F5EE] mb-3">
                Qu'est-ce que la Fédération ?
              </h2>
              <p className="text-[#9DC4AD] leading-relaxed">
                La <strong className="text-[#52B788]">Fédération Voilectia</strong> est l'institution centrale du serveur.
                Elle représente l'intérêt collectif, garantit le respect des lois fédérales et soutient
                le développement des villes et des joueurs.
              </p>
            </div>
          </div>
        </section>

        {/* Rôles */}
        <section>
          <h2 className="font-display text-2xl font-bold text-[#E8F5EE] mb-6">
            Les missions de la Fédération
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: <Coins size={20} />,    title: 'Aides financières',   desc: 'Distribution d\'aides au démarrage pour les nouvelles villes et les joueurs débutants. La Fédération assure que personne ne soit laissé pour compte.' },
              { icon: <Scale size={20} />,    title: 'Régulation économique', desc: 'Fixation des prix minimums, surveillance des abus économiques et arbitrage des conflits commerciaux.' },
              { icon: <FileText size={20} />, title: 'Règlements fédéraux', desc: 'Édiction des lois s\'appliquant à l\'ensemble du territoire. Les villes peuvent avoir leurs propres règles dans ce cadre.' },
              { icon: <Users size={20} />,    title: 'Représentation',      desc: 'Les maires de villes participent aux décisions fédérales. La gouvernance est collective et démocratique.' },
              { icon: <Shield size={20} />,   title: 'Sécurité',            desc: 'Coordination des forces de sécurité pour protéger les voies commerciales et les propriétés des joueurs.' },
              { icon: <HelpCircle size={20} />, title: 'Support',           desc: 'Aide à l\'intégration des nouveaux joueurs et orientation dans les premières heures de jeu.' },
            ].map((item) => (
              <div key={item.title} className="card-hover p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-[rgba(82,183,136,0.1)] text-[#52B788] flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[#E8F5EE] text-sm mb-1.5">{item.title}</h3>
                  <p className="text-[#9DC4AD] text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Subventions */}
        <section>
          <h2 className="font-display text-2xl font-bold text-[#E8F5EE] mb-6">
            Subventions disponibles
          </h2>
          <div className="space-y-3">
            {[
              { title: 'Aide au démarrage',     amount: 'Variable',    desc: 'Tout nouveau joueur reçoit une aide initiale en VLC pour ses premiers achats.' },
              { title: 'Subvention ville',       amount: 'Sur demande', desc: 'Les nouvelles villes peuvent demander une subvention pour leurs infrastructures de base.' },
              { title: 'Aide infrastructure',   amount: 'Sur projet',  desc: 'Projets routiers, bridges, ports... La Fédération cofinance les grandes infrastructures.' },
              { title: 'Programme emploi',      amount: 'Mensuel',     desc: 'Compensation temporaire pour les joueurs en transition entre deux métiers.' },
            ].map((sub) => (
              <div key={sub.title} className="card p-5 flex items-center gap-5">
                <div className="w-20 text-center flex-shrink-0">
                  <span className="badge-gold text-[11px]">{sub.amount}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#E8F5EE] text-sm mb-1">{sub.title}</h3>
                  <p className="text-[#9DC4AD] text-xs">{sub.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 card p-4 flex gap-3 border-[rgba(212,160,23,0.2)]">
            <Coins size={16} className="text-[#D4A017] flex-shrink-0 mt-0.5" />
            <p className="text-[#9DC4AD] text-xs">
              Pour faire une demande de subvention, ouvrez un ticket sur le Discord Voilectia dans la catégorie "Fédération".
            </p>
          </div>
        </section>

        {/* Contact Fédération */}
        <section className="card p-8 text-center">
          <Shield size={32} className="text-[#52B788] mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-[#E8F5EE] mb-3">
            Contacter la Fédération
          </h2>
          <p className="text-[#9DC4AD] text-sm mb-6 max-w-md mx-auto">
            Pour toute demande officielle, litige, subvention ou proposition de loi fédérale,
            utilisez les tickets Discord dédiés.
          </p>
          <a
            href={process.env.NEXT_PUBLIC_DISCORD_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex"
          >
            Ouvrir un ticket Fédération
          </a>
        </section>

      </div>
    </div>
  )
}
