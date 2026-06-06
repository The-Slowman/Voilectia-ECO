'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Sun, Moon, Bell, ChevronRight, Plus, FileText, RefreshCw, BookOpen, Building2, Calendar, Gift, FileCode } from 'lucide-react'
import type { AdminTheme } from './AdminShell'
import { useState } from 'react'

/* ── Breadcrumb map ─────────────────────────────────────── */
const CRUMBS: Record<string, string> = {
  '/admin':             'Dashboard',
  '/admin/membres':     'Membres',
  '/admin/staff':       'Staff',
  '/admin/rangs':       'Rôles',
  '/admin/jobs':        'Métiers',
  '/admin/recrutement': 'Recrutement',
  '/admin/articles':    'Articles',
  '/admin/changelog':   'Changelog',
  '/admin/guides':      'Guides',
  '/admin/tutoriels':   'Tutoriels',
  '/admin/faq':         'FAQ',
  '/admin/reglement':   'Règlement',
  '/admin/contenus':    'Pages CMS',
  '/admin/pages':       'Pages',
  '/admin/villes':      'Villes',
  '/admin/progression': 'Progression',
  '/admin/serveur':     'Config Serveur',
  '/admin/parametres':  'Paramètres',
  '/admin/evenements':  'Événements',
  '/admin/giveaways':   'Giveaways',
  '/admin/sondage':     'Sondages',
  '/admin/forum':       'Forum',
  '/admin/suggestions': 'Suggestions',
  '/admin/messages':    'Messages',
  '/admin/audit':       'Audit / Logs',
  '/admin/medias':      'Médias',
}

const SECTION: Record<string, string> = {
  membres: 'Communauté', staff: 'Communauté', rangs: 'Communauté', jobs: 'Communauté', recrutement: 'Communauté',
  articles: 'Contenu', changelog: 'Contenu', guides: 'Contenu', tutoriels: 'Contenu', faq: 'Contenu', reglement: 'Contenu', contenus: 'Contenu', pages: 'Contenu',
  villes: 'Serveur', progression: 'Serveur', serveur: 'Serveur',
  evenements: 'Animation', giveaways: 'Animation', sondage: 'Animation',
  forum: 'Communication', suggestions: 'Communication', messages: 'Communication',
  parametres: 'Administration', audit: 'Administration', medias: 'Administration',
}

function useBreadcrumbs(pathname: string) {
  if (pathname === '/admin') return [{ label: 'Dashboard', href: '/admin' }]
  const parts   = pathname.split('/').filter(Boolean)
  const section = parts[1] ? SECTION[parts[1]] : null
  const page    = parts[1] ? (CRUMBS[`/admin/${parts[1]}`] ?? parts[1]) : null
  const isDetail = parts.length > 2
  const crumbs: Array<{ label: string; href: string }> = [{ label: 'Admin', href: '/admin' }]
  if (section) crumbs.push({ label: section, href: '' })
  if (page)    crumbs.push({ label: page, href: `/admin/${parts[1]}` })
  if (isDetail) crumbs.push({ label: parts[2] === 'nouveau' ? 'Nouveau' : 'Détail', href: '' })
  return crumbs
}

/* ── Quick create menu ──────────────────────────────────── */
const QUICK_CREATES = [
  { label: 'Article',    href: '/admin/articles/new',   icon: FileText,   emoji: '📰' },
  { label: 'Changelog',  href: '/admin/changelog',      icon: RefreshCw,  emoji: '📜' },
  { label: 'Guide',      href: '/admin/guides',         icon: BookOpen,   emoji: '📚' },
  { label: 'Ville',      href: '/admin/villes/nouveau', icon: Building2,  emoji: '🏘️' },
  { label: 'Événement',  href: '/admin/evenements',     icon: Calendar,   emoji: '🎉' },
  { label: 'Giveaway',   href: '/admin/giveaways',      icon: Gift,       emoji: '🎁' },
  { label: 'Page CMS',   href: '/admin/contenus',       icon: FileCode,   emoji: '📄' },
]

interface Props {
  user:                  { name: string }
  theme:                 AdminTheme
  onToggleTheme:         () => void
  onToggleMobileSidebar: () => void
}

export function AdminHeader({ user, theme, onToggleTheme, onToggleMobileSidebar }: Props) {
  const pathname    = usePathname()
  const breadcrumbs = useBreadcrumbs(pathname)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <header style={{
      height: 'var(--adm-header-height)',
      background: 'var(--adm-sidebar)',
      borderBottom: '1px solid var(--adm-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px 0 20px',
      flexShrink: 0,
      gap: 12,
      position: 'relative',
      zIndex: 10,
    }}>

      {/* Left — hamburger + breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>

        {/* Mobile hamburger */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text-2)', padding: '5px 6px', borderRadius: 5, flexShrink: 0 }}
          aria-label="Menu"
        >
          <Menu size={17} />
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 0 }}>
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1
            return (
              <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && (
                  <ChevronRight size={12} style={{ color: 'var(--adm-text-4)', margin: '0 4px', flexShrink: 0 }} />
                )}
                {isLast ? (
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-text-1)', whiteSpace: 'nowrap' }}>
                    {crumb.label}
                  </span>
                ) : crumb.href ? (
                  <Link
                    href={crumb.href}
                    style={{ fontSize: 13, fontWeight: 400, color: 'var(--adm-text-3)', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--adm-text-1)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--adm-text-3)')}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--adm-text-3)', whiteSpace: 'nowrap' }}>{crumb.label}</span>
                )}
              </span>
            )
          })}
        </nav>
      </div>

      {/* Right — actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>

        {/* Quick create button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowCreate(p => !p)}
            className="adm-btn adm-btn-primary adm-btn-sm"
            style={{ gap: 5, padding: '5px 10px' }}
            aria-label="Créer"
          >
            <Plus size={13} />
            <span className="hidden sm:inline" style={{ fontSize: 12 }}>Créer</span>
          </button>

          {showCreate && (
            <>
              {/* Backdrop */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                onClick={() => setShowCreate(false)}
              />
              {/* Dropdown */}
              <div
                className="adm-scale-in"
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 50,
                  background: 'var(--adm-surface)', border: '1px solid var(--adm-border)',
                  borderRadius: 8, padding: 6, minWidth: 180,
                  boxShadow: 'var(--adm-shadow-lg)',
                }}
              >
                <div style={{ padding: '4px 10px 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--adm-text-4)' }}>
                  Créer
                </div>
                {QUICK_CREATES.map(item => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowCreate(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        padding: '7px 10px', borderRadius: 5,
                        textDecoration: 'none',
                        color: 'var(--adm-text-2)',
                        fontSize: 13, fontWeight: 450,
                        transition: 'background 0.1s, color 0.1s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--adm-surface-2)'; e.currentTarget.style.color = 'var(--adm-text-1)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--adm-text-2)' }}
                    >
                      <span style={{ fontSize: 14 }}>{item.emoji}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: 'var(--adm-border)', margin: '0 2px' }} />

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text-3)', padding: '6px 7px', borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.15s, background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--adm-surface-2)'; e.currentTarget.style.color = 'var(--adm-text-1)' }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--adm-text-3)' }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Notifications */}
        <button
          title="Notifications"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text-3)', padding: '6px 7px', borderRadius: 6, display: 'flex', alignItems: 'center', position: 'relative', transition: 'color 0.15s, background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--adm-surface-2)'; e.currentTarget.style.color = 'var(--adm-text-1)' }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--adm-text-3)' }}
        >
          <Bell size={14} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: 'var(--adm-border)', margin: '0 2px' }} />

        {/* User chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 10px 4px 5px',
          borderRadius: 7,
          background: 'var(--adm-surface-2)',
          border: '1px solid var(--adm-border)',
          cursor: 'default',
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'var(--adm-accent-sub)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: 'var(--adm-accent)',
            flexShrink: 0,
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--adm-text-1)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name}
          </span>
        </div>
      </div>
    </header>
  )
}
