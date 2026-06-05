'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SteamLoginButton } from '@/components/ui/SteamLoginButton'

const NAV_LINKS = [
  { label: 'Accueil',      href: '/' },
  { label: 'Présentation', href: '/presentation' },
  {
    label: 'Serveur',
    href: '#',
    children: [
      { label: 'Règlement',  href: '/reglement',   icon: '📜' },
      { label: 'Guides',     href: '/guides',      icon: '📖' },
      { label: 'Changelog',  href: '/changelog',   icon: '🔄' },
      { label: 'Économie',   href: '/economie',    icon: '💰' },
      { label: 'Carte',      href: '/carte',       icon: '🗺️' },
      { label: 'Fédération', href: '/federation',  icon: '🏛️' },
    ],
  },
  {
    label: 'Communauté',
    href: '#',
    children: [
      { label: 'Forum',        href: '/forum',        icon: '💬' },
      { label: 'Villes',       href: '/villes',       icon: '🏙️' },
      { label: 'Événements',   href: '/evenements',   icon: '🎉' },
      { label: 'Tutoriels',    href: '/tutoriels',    icon: '🎓' },
      { label: 'Suggestions',  href: '/suggestions',  icon: '💡' },
      { label: 'Sondages',     href: '/sondage',      icon: '📋' },
      { label: 'Recrutement',  href: '/recrutement',  icon: '🛡️' },
      { label: 'Staff',        href: '/staff',        icon: '👥' },
      { label: 'Contact',      href: '/contact',      icon: '✉️' },
      { label: 'Soutenir',     href: '/soutenir',     icon: '❤️' },
    ],
  },
  { label: 'FAQ',         href: '/faq' },
  { label: 'Top-Serveur', href: '/top-serveur', badge: '🏆' },
]

export function Header() {
  const [scrolled,     setScrolled]     = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[#1A3D2B] backdrop-blur-xl border-b-2 border-[#D4A820] shadow-[0_4px_24px_rgba(26,61,43,0.35)]'
          : 'bg-[#1A3D2B]'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/images/logo.png"
                alt="Voilectia ECO"
                fill
                className="object-contain drop-shadow-[0_0_8px_rgba(82,183,136,0.4)]"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg md:text-xl text-[#E8F5EE] tracking-wide">
                VOILECTIA
              </span>
              <span className="block text-[10px] tracking-[0.3em] text-[#52B788] uppercase -mt-0.5">
                ECO
              </span>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      activeDropdown === link.label
                        ? 'text-[#D4A820] bg-[rgba(212,168,32,0.12)]'
                        : 'text-[rgba(242,232,213,0.65)] hover:text-[#F2E8D5] hover:bg-[rgba(242,232,213,0.08)]'
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      className={cn(
                        'transition-transform duration-200',
                        activeDropdown === link.label ? 'rotate-180' : ''
                      )}
                    />
                  </button>

                  {activeDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-[#1A3D2B] border border-[rgba(212,168,32,0.2)] rounded-xl shadow-[0_8px_40px_rgba(26,61,43,0.5)] overflow-hidden">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                            pathname === child.href
                              ? 'bg-[rgba(82,183,136,0.12)] text-[#52B788]'
                              : 'text-[rgba(242,232,213,0.65)] hover:bg-[rgba(242,232,213,0.08)] hover:text-[#F2E8D5]'
                          )}
                        >
                          <span>{child.icon}</span>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-[#D4A820] bg-[rgba(212,168,32,0.1)]'
                      : 'text-[rgba(242,232,213,0.65)] hover:text-[#F2E8D5] hover:bg-[rgba(242,232,213,0.08)]'
                  )}
                >
                  {(link as { badge?: string }).badge && (
                    <span className="text-xs">{(link as { badge?: string }).badge}</span>
                  )}
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <SteamLoginButton />
            </div>
            <a
              href={process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.gg/voilectia'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-discord hidden sm:flex text-sm px-4 py-2 rounded-lg font-semibold items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.93 21.19a.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Discord
              <ExternalLink size={12} />
            </a>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-[rgba(242,232,213,0.65)] hover:text-[#F2E8D5] hover:bg-[rgba(242,232,213,0.08)] transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="lg:hidden bg-[rgba(12,31,20,0.98)] backdrop-blur-xl border-t border-[rgba(82,183,136,0.12)] max-h-[80vh] overflow-y-auto">
          <nav className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === link.label ? null : link.label)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[rgba(242,232,213,0.65)] hover:text-[#F2E8D5]"
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      className={cn('transition-transform', activeDropdown === link.label ? 'rotate-180' : '')}
                    />
                  </button>
                  {activeDropdown === link.label && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-[rgba(82,183,136,0.15)] pl-3">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[rgba(242,232,213,0.65)] hover:text-[#F2E8D5]"
                        >
                          <span>{child.icon}</span>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-[#D4A820] bg-[rgba(82,183,136,0.1)]'
                      : 'text-[rgba(242,232,213,0.65)] hover:text-[#F2E8D5]'
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-3 border-t border-[rgba(82,183,136,0.12)]">
              <a
                href={process.env.NEXT_PUBLIC_DISCORD_URL || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-discord flex w-full justify-center text-sm px-4 py-2.5 rounded-lg font-semibold items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.93 21.19a.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
                Rejoindre le Discord
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
