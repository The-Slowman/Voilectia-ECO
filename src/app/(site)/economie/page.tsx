import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { Coins, ShoppingCart, TrendingUp, Scale, Store, Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Économie',
  description: 'Découvrez la monnaie VLC et le système économique EcoGnome sur le serveur Voilectia ECO.',
}

export default function EconomiePage() {
  return (
    <div>
      <PageHero
        title="Économie"
        subtitle="La monnaie VLC et le système EcoGnome — une économie équilibrée au cœur de Voilectia."
        badge="💰 Système économique"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-14">

        {/* VLC */}
        <section>
          <div className="card p-8 border-l-4 border-[#D4A017]">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-[rgba(212,160,23,0.1)] text-[#D4A017] flex items-center justify-center flex-shrink-0">
                <Coins size={28} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-[#E8F5EE] mb-3">
                  La monnaie VLC
                </h2>
                <p className="text-[#9DC4AD] leading-relaxed mb-4">
                  Le <strong className="text-[#E9C46A]">VLC (VoiLeCtion)</strong> est la monnaie officielle et unique du serveur Voilectia.
                  Toutes les transactions commerciales, les salaires et les échanges se font en VLC.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: <Scale size={16} />,      label: 'Équitable',    desc: 'Prix minimums garantis pour éviter le dumping.' },
                    { icon: <TrendingUp size={16} />, label: 'Stable',       desc: 'Régulation par la Fédération pour éviter l\'inflation.' },
                    { icon: <Store size={16} />,      label: 'Accessible',   desc: 'Obtenue par le travail, les ventes et les subventions.' },
                  ].map((f) => (
                    <div key={f.label} className="bg-[rgba(212,160,23,0.06)] border border-[rgba(212,160,23,0.15)] rounded-lg p-4">
                      <div className="flex items-center gap-2 text-[#E9C46A] mb-2">
                        {f.icon}
                        <span className="font-semibold text-sm">{f.label}</span>
                      </div>
                      <p className="text-[#9DC4AD] text-xs">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EcoGnome */}
        <section>
          <h2 className="font-display text-2xl font-bold text-[#E8F5EE] mb-6 flex items-center gap-3">
            <ShoppingCart className="text-[#52B788]" size={24} />
            Le système EcoGnome
          </h2>
          <div className="space-y-4">
            <div className="card p-6">
              <p className="text-[#9DC4AD] leading-relaxed">
                <strong className="text-[#52B788]">EcoGnome</strong> est le système de boutiques et d'échanges du serveur.
                Il permet à chaque joueur de créer et gérer des points de vente in-game, d'afficher ses prix
                et de commercer avec toute la communauté.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Créer une boutique',  desc: 'Installez un comptoir EcoGnome dans votre bâtiment et configurez vos produits.' },
                { title: 'Fixer vos prix',      desc: 'Les prix sont libres mais soumis aux minimums fixés par la Fédération.' },
                { title: 'Acheter & Vendre',    desc: 'Consultez les boutiques disponibles et achetez directement in-game.' },
                { title: 'Gérer vos stocks',    desc: 'Suivez vos inventaires et commandes depuis l\'interface EcoGnome.' },
              ].map((item) => (
                <div key={item.title} className="card-hover p-5">
                  <h3 className="font-semibold text-[#52B788] text-sm mb-2">{item.title}</h3>
                  <p className="text-[#9DC4AD] text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prix minimums */}
        <section>
          <h2 className="font-display text-2xl font-bold text-[#E8F5EE] mb-4 flex items-center gap-3">
            <Scale className="text-[#52B788]" size={24} />
            Prix minimums
          </h2>
          <div className="card p-5 flex gap-4 border border-[rgba(82,183,136,0.2)]">
            <Info size={20} className="text-[#52B788] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#9DC4AD] text-sm leading-relaxed mb-3">
                La Fédération fixe des <strong className="text-[#E8F5EE]">prix planchers</strong> pour les ressources de base
                afin d'éviter la dévaluation et d'assurer un revenu décent à tous les producteurs.
                Ces prix sont affichés et mis à jour régulièrement.
              </p>
              <p className="text-[#9DC4AD] text-sm">
                Consultez les prix en vigueur sur notre Discord dans le canal dédié à l'économie.
              </p>
            </div>
          </div>
        </section>

        {/* La Fédération économique */}
        <section>
          <h2 className="font-display text-2xl font-bold text-[#E8F5EE] mb-6">
            Rôle économique de la Fédération
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { emoji: '🏦', title: 'Banque centrale',     desc: 'La Fédération gère la masse monétaire VLC et distribue les aides de démarrage.' },
              { emoji: '📊', title: 'Régulation',          desc: 'Surveillance des prix, intervention en cas de monopole ou déséquilibre.' },
              { emoji: '🤝', title: 'Subventions',         desc: 'Aide aux nouvelles villes, aux projets d\'infrastructure et aux nouveaux joueurs.' },
              { emoji: '⚖️', title: 'Arbitrage',           desc: 'Résolution des conflits commerciaux et litiges économiques.' },
            ].map((item) => (
              <div key={item.title} className="card-hover p-5 flex gap-4">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <h3 className="font-semibold text-[#E8F5EE] text-sm mb-1">{item.title}</h3>
                  <p className="text-[#9DC4AD] text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
