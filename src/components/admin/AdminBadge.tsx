import React from 'react'

export type BadgeVariant =
  | 'green' | 'red' | 'orange' | 'blue' | 'purple' | 'gold' | 'cyan' | 'gray'

const VARIANTS: Record<BadgeVariant, string> = {
  green:  'adm-badge-green',
  red:    'adm-badge-red',
  orange: 'adm-badge-orange',
  blue:   'adm-badge-blue',
  purple: 'adm-badge-purple',
  gold:   'adm-badge-gold',
  cyan:   'adm-badge-cyan',
  gray:   'adm-badge-gray',
}

/* ── Role → variant ─────────────────────────── */
export const ROLE_VARIANT: Record<string, { label: string; variant: BadgeVariant }> = {
  SUPER_ADMIN: { label: '👑 Super Admin', variant: 'gold' },
  ADMIN:       { label: '🔴 Admin',       variant: 'red' },
  MODERATOR:   { label: '🟣 Modérateur',  variant: 'purple' },
  ANIMATOR:    { label: '🟠 Animateur',   variant: 'orange' },
  DEVELOPER:   { label: '🔵 Dev',         variant: 'cyan' },
  PLAYER:      { label: '⚪ Joueur',      variant: 'gray' },
}

/* ── Status → variant ───────────────────────── */
export const STATUS_VARIANT: Record<string, { label: string; variant: BadgeVariant }> = {
  active:    { label: '🟢 Actif',        variant: 'green' },
  banned:    { label: '🔴 Banni',        variant: 'red' },
  pending:   { label: '🟠 En attente',   variant: 'orange' },
  published: { label: '🟢 Publié',       variant: 'green' },
  draft:     { label: '⚪ Brouillon',    variant: 'gray' },
  open:      { label: '🟢 Ouvert',       variant: 'green' },
  closed:    { label: '⚪ Fermé',        variant: 'gray' },
  approved:  { label: '✅ Approuvé',     variant: 'green' },
  rejected:  { label: '❌ Refusé',       variant: 'red' },
}

interface AdminBadgeProps {
  variant?:  BadgeVariant
  children:  React.ReactNode
  dot?:      boolean
  className?: string
}

export function AdminBadge({ variant = 'gray', children, dot, className }: AdminBadgeProps) {
  return (
    <span className={`adm-badge ${VARIANTS[variant]}${className ? ` ${className}` : ''}`}>
      {dot && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: 'currentColor', display: 'inline-block',
        }} />
      )}
      {children}
    </span>
  )
}

/** Shorthand for role badges */
export function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_VARIANT[role] ?? { label: role, variant: 'gray' as const }
  return <AdminBadge variant={meta.variant}>{meta.label}</AdminBadge>
}

/** Shorthand for boolean published/active badges */
export function PublishedBadge({ published }: { published: boolean }) {
  return published
    ? <AdminBadge variant="green" dot>Publié</AdminBadge>
    : <AdminBadge variant="gray"  dot>Brouillon</AdminBadge>
}

export function ActiveBadge({ active }: { active: boolean }) {
  return active
    ? <AdminBadge variant="green" dot>Actif</AdminBadge>
    : <AdminBadge variant="gray"  dot>Inactif</AdminBadge>
}

export function BannedBadge({ banned }: { banned: boolean }) {
  return banned
    ? <AdminBadge variant="red">🔴 Banni</AdminBadge>
    : <AdminBadge variant="green" dot>Actif</AdminBadge>
}
