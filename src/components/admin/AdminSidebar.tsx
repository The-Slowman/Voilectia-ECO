'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Shield, Award, FileText, RefreshCw,
  BookOpen, HelpCircle, FileCode, Building2, TrendingUp, Coins,
  Settings, Calendar, Gift, MessageSquare, Lightbulb, Mail,
  ScrollText, Image as ImageIcon, Briefcase, GraduationCap,
  ClipboardList, UserPlus, Server, X, LogOut, ExternalLink,
  ChevronRight,
} from 'lucide-react'

const NAV = [
  {
    id: 'dashboard', label: 'Dashboard', href: '/admin',
    icon: LayoutDashboard, single: true,
  },
  {
    id: 'community', label: 'Communauté', emoji: '👥', icon: Users,
    items: [
      { label: 'Membres',     href: '/admin/membres',     icon: Users },
      { label: 'Staff',       href: '/admin/staff',       icon: Shield },
      { label: 'Rôles',       href: '/admin/rangs',       icon: Award },
      { label: 'Métiers',     href: '/admin/jobs',        icon: Briefcase },
      { label: 'Recrutement', href: '/admin/recrutement', icon: UserPlus },
    ],
  },
  {
    id: 'content', label: 'Contenu', emoji: '📰', icon: FileText,
    items: [
      { label: 'Articles',    href: '/admin/articles',    icon: FileText },
      { label: 'Changelog',   href: '/admin/changelog',   icon: RefreshCw },
      { label: 'Guides',      href: '/admin/guides',      icon: BookOpen },
      { label: 'Tutoriels',   href: '/admin/tutoriels',   icon: GraduationCap },
      { label: 'FAQ',         href: '/admin/faq',         icon: HelpCircle },
      { label: 'Règlement',   href: '/admin/reglement',   icon: Shield },
      { label: 'Pages CMS',   href: '/admin/contenus',    icon: FileCode },
    ],
  },
  {
    id: 'server', label: 'Serveur', emoji: '🏘️', icon: Building2,
    items: [
      { label: 'Villes',        href: '/admin/villes',      icon: Building2 },
      { label: 'Progression',   href: '/admin/progression', icon: TrendingUp },
      { label: 'Économie',      href: '/admin/serveur',     icon: Coins },
      { label: 'Configuration', href: '/admin/parametres',  icon: Server },
    ],
  },
  {
    id: 'animation', label: 'Animation', emoji: '🎁', icon: Gift,
    items: [
      { label: 'Événements', href: '/admin/evenements', icon: Calendar },
      { label: 'Giveaways',  href: '/admin/giveaways',  icon: Gift },
      { label: 'Sondages',   href: '/admin/sondage',    icon: ClipboardList },
    ],
  },
  {
    id: 'communication', label: 'Communication', emoji: '💬', icon: MessageSquare,
    items: [
      { label: 'Forum',       href: '/admin/forum',       icon: MessageSquare },
      { label: 'Suggestions', href: '/admin/suggestions', icon: Lightbulb },
      { label: 'Messages',    href: '/admin/messages',    icon: Mail },
    ],
  },
  {
    id: 'system', label: 'Administration', emoji: '⚙️', icon: Settings,
    items: [
      { label: 'Paramètres',   href: '/admin/parametres', icon: Settings },
      { label: 'Audit / Logs', href: '/admin/audit',      icon: ScrollText },
      { label: 'Médias',       href: '/admin/medias',     icon: ImageIcon },
    ],
  },
] as const

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'var(--adm-gold)' },
  ADMIN:       { label: 'Admin',       color: 'var(--adm-red)' },
  MODERATOR:   { label: 'Modérateur',  color: 'var(--adm-blue)' },
  ANIMATOR:    { label: 'Animateur',   color: 'var(--adm-purple)' },
  DEVELOPER:   { label: 'Dev',         color: 'var(--adm-cyan)' },
}

interface Props {
  user:          { name: string; email: string; role: string }
  mobileOpen:    boolean
  onMobileClose: () => void
}

export function AdminSidebar({ user, mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  function isSectionActive(items: ReadonlyArray<{ href: string }>) {
    return items.some(i => isActive(i.href))
  }

  const roleMeta = ROLE_BADGE[user.role] ?? { label: user.role, color: 'var(--adm-text-3)' }
  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const inner = (
    <aside style={{
      width: 224, flexShrink: 0,
      background: 'var(--adm-sidebar)',
      borderRight: '1px solid var(--adm-border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflowX: 'hidden',
    }}>
      {/* Brand */}
      <div style={{
        padding: '13px 14px 12px',
        borderBottom: '1px solid var(--adm-border-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <div style={{ position: 'relative', width: 27, height: 27, flexShrink: 0 }}>
            <Image src="/images/logo.png" alt="Voilectia" fill style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--adm-text-1)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              VOILECTIA
            </div>
            <div style={{ fontSize: 10, color: 'var(--adm-accent)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
              Admin
            </div>
          </div>
        </Link>
        <button
          onClick={onMobileClose}
          className="lg:hidden"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text-3)', padding: 4, borderRadius: 4 }}
          aria-label="Fermer menu"
        >
          <X size={15} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {NAV.map((group) => {
          if ('single' in group && group.single) {
            const active = isActive(group.href)
            const Icon = group.icon
            return (
              <div key={group.id} style={{ marginBottom: 4 }}>
                <Link
                  href={group.href}
                  className={'adm-nav-item' + (active ? ' active' : '')}
                  onClick={onMobileClose}
                >
                  <Icon size={14} style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: active ? 500 : 450 }}>{group.label}</span>
                  {active && <ChevronRight size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                </Link>
              </div>
            )
          }

          const items = (group as { items: ReadonlyArray<{ label: string; href: string; icon: React.ComponentType<{ size: number; style?: React.CSSProperties }> }> }).items
          const sActive = isSectionActive(items)

          return (
            <div key={group.id} style={{ marginBottom: 10 }}>
              <div style={{
                padding: '5px 10px 3px',
                fontSize: 10, fontWeight: 600,
                color: sActive ? 'var(--adm-accent)' : 'var(--adm-text-3)',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span>{'emoji' in group ? group.emoji : ''}</span>
                <span>{group.label}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {items.map((item) => {
                  const active = isActive(item.href)
                  const ItemIcon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={'adm-nav-item' + (active ? ' active' : '')}
                        onClick={onMobileClose}
                        style={{ paddingLeft: 14 }}
                      >
                        <ItemIcon size={13} style={{ flexShrink: 0, opacity: active ? 1 : 0.65 }} />
                        <span>{item.label}</span>
                        {active && <ChevronRight size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--adm-border-muted)', padding: '6px 8px 8px', flexShrink: 0 }}>
        <Link href="/" target="_blank" className="adm-nav-item" style={{ marginBottom: 4 }}>
          <ExternalLink size={13} style={{ opacity: 0.55 }} />
          <span style={{ fontSize: 12 }}>Voir le site</span>
        </Link>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '7px 8px 5px',
          borderTop: '1px solid var(--adm-border-muted)',
          marginTop: 2,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 5,
            background: 'var(--adm-accent-sub)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: 'var(--adm-accent)',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--adm-text-1)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: roleMeta.color }}>
              {roleMeta.label}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Déconnexion"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text-3)', padding: 4, borderRadius: 4, flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--adm-red)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--adm-text-3)')}
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex" style={{ flexShrink: 0 }}>{inner}</div>
      {/* Mobile drawer */}
      <div className={'lg:hidden fixed inset-y-0 left-0 z-50 flex' + (mobileOpen ? ' adm-slide-in' : ' hidden')}>
        {inner}
      </div>
    </>
  )
}
