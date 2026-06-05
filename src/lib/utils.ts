import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistance } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, pattern = 'dd MMMM yyyy') {
  return format(new Date(date), pattern, { locale: fr })
}

export function formatRelative(date: Date | string) {
  return formatDistance(new Date(date), new Date(), { addSuffix: true, locale: fr })
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const CHANGELOG_TYPES: Record<string, { label: string; color: string }> = {
  major:   { label: 'Majeur',    color: 'badge-gold' },
  update:  { label: 'Mise à jour', color: 'badge-green' },
  hotfix:  { label: 'Hotfix',    color: 'badge-red' },
  content: { label: 'Contenu',   color: 'badge-blue' },
}

export const RULE_SEVERITY: Record<string, { label: string; color: string; bg: string }> = {
  info:    { label: 'Info',     color: 'text-blue-400',   bg: 'bg-blue-900/20 border-blue-500/20' },
  warning: { label: 'Avertissement', color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-500/20' },
  danger:  { label: 'Interdit', color: 'text-red-400',    bg: 'bg-red-900/20 border-red-500/20' },
}

export const GUIDE_CATEGORIES: Record<string, { label: string; icon: string }> = {
  debutant:  { label: 'Débutant',   icon: '🌱' },
  metier:    { label: 'Métiers',    icon: '⚒️' },
  economie:  { label: 'Économie',   icon: '💰' },
  ecoGnome:  { label: 'EcoGnome',   icon: '🏪' },
  ville:     { label: 'Villes',     icon: '🏙️' },
}
