import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { Globe, Users, Coins, Building2, Shield, Heart, Leaf } from 'lucide-react'
import { getPageContent } from '@/lib/page-content'
import { sanitizeHtml } from '@/lib/sanitize'

export const metadata: Metadata = {
  title: 'Présentation',
  description: 'Découvrez l\'histoire, la philosophie et les valeurs de Voilectia, serveur Eco Semi-RP Chill français.',
  alternates: { canonical: "/presentation" },
}

export const revalidate = 60

const PILLARS = [
  { icon: <Globe size={20} />,     title: 'Semi-RP Chill',   desc: 'Le RP sur Voilectia s\'exprime naturellement à travers les constructions, les choix économiques et l\'organisation sociale. Aucune obligation de jeu vocal ou textuel imposé.' },
  { icon: <Coins size={20} />,     title: 'Économie VLC',    desc: 'La monnaie unique VLC est au cœur du serveur. EcoGnome gère les boutiques, les prix minimums garantissent l\'équité et permettent une économie saine.' },
  { icon: <Building2 size={20} />, title: 'Architecture',    desc: 'Les constructions sont le cœur du RP sur Voilectia. Des villes cohérentes et esthétiques, planifiées par des maires et leurs citoyens.' },
  { icon: <Users size={20} />,     title: 'Coopération',     desc: 'Aucun joueur ne peut progresser seul. La chaîne de production, les échanges commerciaux et la solidarité entre joueurs sont essentiels.' },
  { icon: <Shield size={20} />,    title: 'La Fédération',   desc: 'La Fédération joue le rôle de gouvernement central : elle attribue des subventions, publie des règlements et arbitre les conflits.' },
  { icon: <Heart size={20} />,     title: 'Bienveillance',   desc: 'Une communauté mature, respectueuse et inclusive. Voilectia accueille tout le monde dans un esprit de jeu positif et constructif.' },
]

export default async function PresentationPage() {
  const c = await getPageContent('presentation')

  return (
    <div>
      <PageHero
        title="Présentation"
        subtitle="Découvrez l'univers Voilectia — un serveur Eco pensé pour la coopération, l'économie et les constructions cohérentes."
        badge="🌿 Notre histoire"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Histoire */}
        <section className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1A3D2B] mb-6 flex items-center gap-3">
            <Leaf className="text-[#52B788]" size={24} />
            {c.history_title ?? "L'histoire de Voilectia"}
          </h2>
          {c.history_intro ? (
            <div className="card p-6 md:p-8 text-[#4A6854] leading-relaxed rich-content"
                 dangerouslySetInnerHTML={{ __html: sanitizeHtml(c.history_intro) }} />
          ) : (
            <div className="card p-6 md:p-8 space-y-4 text-[#4A6854] leading-relaxed">
              <p>
                Voilectia est né de la volonté de créer un espace de jeu Eco francophone qui privilégie
                la <strong className="text-[#1A3D2B]">qualité des interactions</strong> sur la compétition.
                Trop souvent, les serveurs Eco deviennent des courses à l'efficacité où la coopération
                passe au second plan.
              </p>
              <p>
                Notre approche est différente : ici, la <strong className="text-[#1A3D2B]">progression est équilibrée</strong>,
                l'économie est régulée par la Fédération et les villes sont construites avec soin et cohérence architecturale.
              </p>
              <p>
                Le nom <strong className="text-[#52B788]">Voilectia</strong> reflète notre philosophie :
                « Voilà ce que l'on construit ensemble ». Chaque saison est une nouvelle aventure partagée.
              </p>
            </div>
          )}
        </section>

        {/* Philosophie */}
        <section className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1A3D2B] mb-6">
            {c.philosophy_title ?? 'Notre philosophie'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PILLARS.map((p, i) => (
              <div key={i} className="card-hover p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-[rgba(82,183,136,0.1)] text-[#52B788] flex items-center justify-center flex-shrink-0">
                  {p.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A3D2B] text-sm mb-1.5">{p.title}</h3>
                  <p className="text-[#4A6854] text-xs leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Valeurs */}
        <section className="mb-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1A3D2B] mb-6">
            Nos valeurs communautaires
          </h2>
          <div className="card p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { emoji: '🤝', value: 'Entraide' },
                { emoji: '🌿', value: 'Respect' },
                { emoji: '⚖️', value: 'Équité' },
                { emoji: '🏗️', value: 'Créativité' },
              ].map((v) => (
                <div key={v.value} className="group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{v.emoji}</div>
                  <div className="font-display font-semibold text-[#52B788] text-sm">{v.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fonctionnement */}
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1A3D2B] mb-6">
            {c.fonctionnement_title ?? 'Comment fonctionne le serveur ?'}
          </h2>
          <div className="space-y-4">
            {[
              { num: '01', title: 'Arrivée & Intégration', desc: 'Vous rejoignez le serveur, lisez le règlement et choisissez votre région de départ. Le Discord est votre principale ressource d\'information.' },
              { num: '02', title: 'Choix d\'un métier', desc: 'Spécialisez-vous dans un métier : agriculteur, mineur, constructeur, commerçant, artisan... La chaîne de production nécessite la coopération.' },
              { num: '03', title: 'Rejoindre ou créer une ville', desc: 'Les villes sont le cœur du serveur. Rejoignez une ville existante ou créez la vôtre avec l\'accord de la Fédération.' },
              { num: '04', title: 'Participer à l\'économie', desc: 'Utilisez EcoGnome pour créer votre boutique, vendre vos productions et participer à l\'économie collective en VLC.' },
              { num: '05', title: 'Construire & Progresser', desc: 'Développez vos compétences, construisez des bâtiments cohérents et participez à la vie communautaire et aux événements.' },
            ].map((step) => (
              <div key={step.num} className="card-hover p-5 flex gap-5">
                <div className="font-display font-black text-3xl text-[rgba(82,183,136,0.2)] flex-shrink-0 w-10">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A3D2B] mb-1">{step.title}</h3>
                  <p className="text-[#4A6854] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
