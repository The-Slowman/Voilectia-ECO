'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Sun, Moon, Bell, ChevronRight } from 'lucide-react'
import type { AdminTheme } from './AdminShell'

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
  villes: 'Serveur', progression: 'Serveur', serveur: 'Serveur', parametres: 'Serveur',
  evenements: 'Animation', giveaways: 'Animation', sondage: 'Animation',
  forum: 'Communication', suggestions: 'Communication', messages: 'Communication',
  audit: 'Administration', medias: 'Administration',
}

function useBreadcrumbs(pathname: string) {
  if (pathname === '/admin') return [{ label: 'Dashboard', href: '/admin' }]
  const parts = pathname.split('/').filter(Boolean) // ['admin', 'membres', '123']
  const section = parts[1] ? SECTION[parts[1]] : null
  const pageName = parts[1] ? (CRUMBS[`/admin/${parts[1]}`] ?? parts[1]) : null
  const isDetail = parts.length > 2
  const crumbs: Array<{ label: string; href: string }> = [{ label: 'Dashboard', href: '/admin' }]
  if (section) crumbs.push({ label: section, href: '' })
  if (pageName) crumbs.push({ label: pageName, href: `/admin/${parts[1]}` })
  if (isDetail) crumbs.push({ label: parts[2] === 'nouveau' ? 'Nouveau' : 'Modifier', href: '' })
  return crumbs
}

interface Props {
  user:                   { name: string }
  theme:                  AdminTheme
  onToggleTheme:          () => void
  onToggleMobileSidebar:  () => void
}

export function AdminHeader({ user, theme, onToggleTheme, onToggleMobileSidebar }: Props) {
  const pathname   = usePathname()
  const breadcrumbs = useBreadcrumbs(pathname)
  const pageTitle  = breadcrumbs[breadcrumbs.length - 1]?.label ?? 'Admin'

  return (
    <header style={{
      height: 48,
      background: 'var(--adm-sidebar)',
      borderBottom: '1px solid var(--adm-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
      gap: 12,
    }}>
      {/* Left — hamburger + breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
        {/* Mobile hamburger */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--adm-text-2)', padding: '4px 6px', borderRadius: 5,
            flexShrink: 0,
          }}
          aria-label="Menu"
        >
          <Menu size={16} />
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 0 }}>
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1
            return (
              <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && (
                  <ChevronRight
                    size={12}
                    style={{ color: 'var(--adm-text-3)', margin: '0 3px', flexShrink: 0 }}
                  />
                )}
                {isLast ? (
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--adm-text-1)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {crumb.label}
                  </span>
                ) : crumb.href ? (
                  <Link
                    href={crumb.href}
                    style={{
                      fontSize: 13,
                      fontWeight: 400,
                      color: 'var(--adm-text-2)',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--adm-text-1)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--adm-text-2)')}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--adm-text-3)', whiteSpace: 'nowrap' }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            )
          })}
        </nav>
      </div>

      {/* Right — actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--adm-text-2)', padding: '6px', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--adm-surface-2)'; e.currentTarget.style.color = 'var(--adm-text-1)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--adm-text-2)' }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Notifications placeholder */}
        <button
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--adm-text-2)', padding: '6px', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
            position: 'relative',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--adm-surface-2)'; e.currentTarget.style.color = 'var(--adm-text-1)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--adm-text-2)' }}
          title="Notifications"
        >
          <Bell size={14} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--adm-border)', margin: '0 4px' }} />

        {/* User chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '4px 10px 4px 6px',
          borderRadius: 6,
          background: 'var(--adm-surface-2)',
          border: '1px solid var(--adm-border)',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 4,
            background: 'var(--adm-accent-sub)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: 'var(--adm-accent)',
            flexShrink: 0,
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span style={{
            fontSize: 12, fontWeight: 500, color: 'var(--adm-text-1)',
            maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {user.name}
          </span>
        </div>
      </div>
    </header>
  )
}
