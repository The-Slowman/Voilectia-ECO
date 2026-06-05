import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Heart } from 'lucide-react'

const FOOTER_LINKS = {
  Serveur: [
    { label: 'Présentation',  href: '/presentation' },
    { label: 'Règlement',     href: '/reglement' },
    { label: 'Changelog',     href: '/changelog' },
    { label: 'Guides',        href: '/guides' },
  ],
  Communauté: [
    { label: 'Forum',         href: '/forum' },
    { label: 'Suggestions',   href: '/suggestions' },
    { label: 'Villes',        href: '/villes' },
    { label: 'Événements',    href: '/evenements' },
  ],
  Informations: [
    { label: '🏆 Top-Serveur', href: '/top-serveur' },
    { label: 'Économie',       href: '/economie' },
    { label: 'FAQ',            href: '/faq' },
    { label: 'Nous soutenir',  href: '/soutenir' },
    { label: 'Contact',        href: '/contact' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[#1A3D2B] border-t-2 border-[#D4A820]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative w-12 h-12">
                <Image
                  src="/images/logo.png"
                  alt="Voilectia ECO"
                  fill
                  className="object-contain drop-shadow-[0_0_8px_rgba(82,183,136,0.3)]"
                />
              </div>
              <div>
                <span className="font-display font-bold text-xl text-[#F2E8D5]">VOILECTIA</span>
                <span className="block text-xs tracking-[0.3em] text-[#D4A820] uppercase">ECO</span>
              </div>
            </Link>
            <p className="text-[rgba(242,232,213,0.55)] text-sm leading-relaxed mb-6 max-w-xs">
              Serveur Eco Semi-RP Chill français axé sur la coopération, l'économie, les villes et les constructions.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#D4A820]">
              {['Économie', 'Partage', 'Entraide', 'Solidarité'].map((v) => (
                <span
                  key={v}
                  className="px-3 py-1 rounded-full border border-[rgba(212,168,32,0.3)] bg-[rgba(212,168,32,0.1)]"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-display font-semibold text-sm text-[#F2E8D5] mb-4 tracking-wide uppercase">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[rgba(242,232,213,0.55)] hover:text-[#D4A820] transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#2D6A4F] group-hover:bg-[#52B788] transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Discord CTA */}
        <div className="py-6 border-t border-[rgba(82,183,136,0.08)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[rgba(242,232,213,0.55)] text-sm">
              Rejoignez notre communauté sur Discord pour les dernières annonces !
            </p>
            <a
              href={process.env.NEXT_PUBLIC_DISCORD_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.93 21.19a.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Rejoindre Discord
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-4 border-t border-[rgba(82,183,136,0.06)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[rgba(242,232,213,0.35)]">
          <p>
            © {new Date().getFullYear()} Voilectia ECO. Tous droits réservés.
            &nbsp;·&nbsp; Non affilié à Strange Loop Games.
          </p>
          <p className="flex items-center gap-1">
            Fait avec <Heart size={11} className="text-red-500 fill-red-500" /> pour la communauté
          </p>
        </div>

      </div>
    </footer>
  )
}
