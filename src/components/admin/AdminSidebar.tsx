'use client'

import Link from 'next/link'
import NextImage from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, UserX, Shield, Award, FileText, RefreshCw,
  BookOpen, HelpCircle, FileCode, Building2, TrendingUp, Coins,
  Settings, Calendar, Gift, MessageSquare, Lightbulb, Mail,
  ScrollText, Image as MediaIcon, Briefcase, GraduationCap,
  ClipboardList, UserPlus, Server, X, LogOut, ExternalLink,
  ChevronDown, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

/* ── Nav structure ──────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    id: 'dashboard',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    id: 'community', label: 'Communauté', emoji: '👥',
    items: [
      { label: 'Membres',     href: '/admin/membres',            icon: Users },
      { label: 'Inactifs',    href: '/admin/membres/inactifs',   icon: UserX },
      { label: 'Staff',       href: '/admin/staff',              icon: Shield },
      { label: 'Rôles',       href: '/admin/rangs',              icon: Award },
      { label: 'Métiers',     href: '/admin/jobs',               icon: Briefcase },
      { label: 'Recrutement', href: '/admin/recrutement',        icon: UserPlus },
    ],
  },
  {
    id: 'content', label: 'Contenu', emoji: '📰',
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
    id: 'server', label: 'Serveur', emoji: '🌍',
    items: [
      { label: 'Villes',        href: '/admin/villes',      icon: Building2 },
      { label: 'Progression',   href: '/admin/progression', icon: TrendingUp },
      { label: 'Économie',      href: '/admin/serveur',     icon: Coins },
      { label: 'Configuration', href: '/admin/parametres',  icon: Server },
    ],
  },
  {
    id: 'events', label: 'Événements', emoji: '🎉',
    items: [
      { label: 'Événements', href: '/admin/evenements', icon: Calendar },
      { label: 'Giveaways',  href: '/admin/giveaways',  icon: Gift },
      { label: 'Sondages',   href: '/admin/sondage',    icon: ClipboardList },
    ],
  },
  {
    id: 'communication', label: 'Communication', emoji: '💬',
    items: [
      { label: 'Forum',       href: '/admin/forum',       icon: MessageSquare },
      { label: 'Suggestions', href: '/admin/suggestions', icon: Lightbulb },
      { label: 'Messages',    href: '/admin/messages',    icon: Mail },
    ],
  },
  {
    id: 'system', label: 'Administration', emoji: '⚙️',
    items: [
      { label: 'Paramètres',   href: '/admin/parametres', icon: Settings },
      { label: 'Audit / Logs', href: '/admin/audit',      icon: ScrollText },
      { label: 'Médias',       href: '/admin/medias',     icon: MediaIcon },
    ],
  },
] as const

const ROLE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'var(--adm-gold)',   bg: 'var(--adm-gold-sub)' },
  ADMIN:       { label: 'Admin',       color: 'var(--adm-red)',    bg: 'var(--adm-red-sub)' },
  MODERATOR:   { label: 'Modérateur',  color: 'var(--adm-purple)', bg: 'var(--adm-purple-sub)' },
  ANIMATOR:    { label: 'Animateur',   color: 'var(--adm-orange)', bg: 'var(--adm-orange-sub)' },
  DEVELOPER:   { label: 'Dev',         color: 'var(--adm-cyan)',   bg: 'var(--adm-cyan-sub)' },
  EDITOR:      { label: 'Éditeur',     color: 'var(--adm-blue)',   bg: 'var(--adm-blue-sub)' },
}

interface Props {
  user:          { name: string; email: string; role: string }
  mobileOpen:    boolean
  onMobileClose: () => void
}

function NavSection({
  section,
  pathname,
  onMobileClose,
}: {
  section: typeof NAV_SECTIONS[number]
  pathname: string
  onMobileClose: () => void
}) {
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const sectionActive = section.items.some(i =>
    isActive(i.href, 'exact' in i ? (i as { exact?: boolean }).exact : false)
  )

  const [open, setOpen] = useState(sectionActive)

  // Dashboard — no collapsible
  if (!('label' in section)) {
    return (
      <div style={{ marginBottom: 2 }}>
        {section.items.map((item) => {
          const active = isActive(item.href, 'exact' in item ? (item as { exact?: boolean }).exact : false)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={'adm-nav-item' + (active ? ' active' : '')}
              onClick={onMobileClose}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 2 }}>
      {/* Section header — clickable to collapse */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          width: '100%', padding: '5px 10px 4px',
          background: 'none', border: 'none', cursor: 'pointer',
          borderRadius: 5,
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--adm-surface-2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: sectionActive ? 'var(--adm-accent)' : 'var(--adm-text-4)', flex: 1, textAlign: 'left' }}>
          {'emoji' in section ? `${section.emoji} ` : ''}{section.label}
        </span>
        <ChevronDown size={11} style={{ color: 'var(--adm-text-4)', transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>

      {/* Items */}
      {open && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '1px 0 4px' }}>
          {section.items.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={'adm-nav-item' + (active ? ' active' : '')}
                  onClick={onMobileClose}
                  style={{ paddingLeft: 12, fontSize: 12.5 }}
                >
                  <Icon size={13} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {active && <ChevronRight size={10} style={{ opacity: 0.4, flexShrink: 0 }} />}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function SidebarInner({ user, onMobileClose }: { user: Props['user']; onMobileClose: () => void }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const roleMeta  = ROLE_STYLE[user.role] ?? { label: user.role, color: 'var(--adm-text-3)', bg: 'var(--adm-surface-3)' }
  const initials  = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: 'var(--adm-sidebar-width)', flexShrink: 0,
      background: 'var(--adm-sidebar)',
      borderRight: '1px solid var(--adm-border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflowX: 'hidden',
    }}>

      {/* ── Brand ─────────────────────────────────────────── */}
      <div style={{
        padding: '12px 14px 11px',
        borderBottom: '1px solid var(--adm-border-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, gap: 8,
      }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flex: 1, minWidth: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'var(--adm-accent-sub)',
            border: '1px solid var(--adm-accent-sub)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            <NextImage src="/images/logo.png" alt="Voilectia" width={22} height={22} style={{ objectFit: 'contain' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--adm-text-1)', lineHeight: 1.2, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Voilectia ECO
            </div>
            <div style={{ fontSize: 10, color: 'var(--adm-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, lineHeight: 1.5 }}>
              Admin
            </div>
          </div>
        </Link>
        <button
          onClick={onMobileClose}
          className="adm-sidebar-close-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text-3)', padding: 4, borderRadius: 4, flexShrink: 0 }}
          aria-label="Fermer"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Nav ───────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '10px 8px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_SECTIONS.map((section) => (
          <NavSection
            key={section.id}
            section={section as typeof NAV_SECTIONS[number]}
            pathname={pathname}
            onMobileClose={onMobileClose}
          />
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--adm-border-muted)', padding: '6px 8px 8px', flexShrink: 0 }}>
        <Link href="/" target="_blank" className="adm-nav-item" style={{ marginBottom: 2, fontSize: 12 }}>
          <ExternalLink size={12} style={{ opacity: 0.5 }} />
          <span style={{ flex: 1 }}>Voir le site</span>
        </Link>

        {/* User profile */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '8px 10px',
          borderRadius: 6,
          background: 'var(--adm-surface-2)',
          border: '1px solid var(--adm-border-muted)',
          marginTop: 4,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'var(--adm-accent-sub)',
            border: '1px solid var(--adm-accent-sub)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: 'var(--adm-accent)',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--adm-text-1)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: roleMeta.color, background: roleMeta.bg, borderRadius: 10, padding: '1px 6px', lineHeight: 1.6, display: 'inline-block' }}>
              {roleMeta.label}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Déconnexion"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text-3)', padding: 4, borderRadius: 4, flexShrink: 0, transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--adm-red)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--adm-text-3)')}
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  )
}

export function AdminSidebar({ user, mobileOpen, onMobileClose }: Props) {
  return (
    <>
      {/* Desktop — toujours dans le flow, masqué via CSS sous 1024px */}
      <div className="adm-sidebar-desktop" style={{ flexShrink: 0 }}>
        <SidebarInner user={user} onMobileClose={onMobileClose} />
      </div>

      {/* Mobile drawer — fixed overlay, conditionnel via JSX */}
      {mobileOpen && (
        <div
          className="adm-slide-in"
          style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, display: 'flex' }}
        >
          <SidebarInner user={user} onMobileClose={onMobileClose} />
        </div>
      )}
    </>
  )
}
