'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, RefreshCw, BookOpen, Calendar,
  Building2, Shield, HelpCircle, Users, Image as ImageIcon,
  Settings, ChevronRight, MessageSquare, Lightbulb, ClipboardList,
  UserPlus, Award, FileCode, GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { section: 'Tableau de bord', items: [
    { label: 'Dashboard',     href: '/admin',                icon: <LayoutDashboard size={16} /> },
  ]},
  { section: 'Contenu', items: [
    { label: 'Articles',      href: '/admin/articles',       icon: <FileText size={16} /> },
    { label: 'Changelog',     href: '/admin/changelog',      icon: <RefreshCw size={16} /> },
    { label: 'Guides',        href: '/admin/guides',         icon: <BookOpen size={16} /> },
    { label: 'Événements',    href: '/admin/evenements',     icon: <Calendar size={16} /> },
  ]},
  { section: 'Communauté', items: [
    { label: 'Forum',         href: '/admin/forum',          icon: <MessageSquare size={16} /> },
    { label: 'Suggestions',   href: '/admin/suggestions',    icon: <Lightbulb size={16} /> },
    { label: 'Villes',        href: '/admin/villes',         icon: <Building2 size={16} /> },
    { label: 'Recrutement',   href: '/admin/recrutement',    icon: <UserPlus size={16} /> },
    { label: 'Sondages',      href: '/admin/sondage',        icon: <ClipboardList size={16} /> },
    { label: 'Tutoriels',     href: '/admin/tutoriels',      icon: <GraduationCap size={16} /> },
    { label: 'Rangs',         href: '/admin/rangs',          icon: <Award size={16} /> },
    { label: 'Pages & Nav',   href: '/admin/pages',          icon: <FileCode size={16} /> },
    { label: 'Règlement',     href: '/admin/reglement',      icon: <Shield size={16} /> },
    { label: 'FAQ',           href: '/admin/faq',            icon: <HelpCircle size={16} /> },
    { label: 'Staff',         href: '/admin/staff',          icon: <Users size={16} /> },
  ]},
  { section: 'Système', items: [
    { label: 'Médias',        href: '/admin/medias',         icon: <ImageIcon size={16} /> },
    { label: 'Paramètres',    href: '/admin/parametres',     icon: <Settings size={16} /> },
  ]},
]

interface AdminSidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-shrink-0 bg-[#0C1F14] border-r border-[rgba(82,183,136,0.1)] flex flex-col h-screen sticky top-0">

      {/* Brand */}
      <div className="p-4 border-b border-[rgba(82,183,136,0.08)]">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8">
            <Image src="/images/logo.png" alt="Voilectia" fill className="object-contain" />
          </div>
          <div>
            <p className="font-display font-bold text-sm text-[#E8F5EE]">Voilectia</p>
            <p className="text-[10px] text-[#52B788] tracking-wide uppercase">Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            <p className="text-[10px] font-semibold text-[#5A8A6A] uppercase tracking-widest px-2 mb-1.5">
              {section.section}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all',
                        active
                          ? 'bg-[rgba(82,183,136,0.12)] text-[#52B788]'
                          : 'text-[#9DC4AD] hover:bg-[rgba(82,183,136,0.06)] hover:text-[#E8F5EE]'
                      )}
                    >
                      <span className={active ? 'text-[#52B788]' : 'text-[#5A8A6A]'}>{item.icon}</span>
                      {item.label}
                      {active && <ChevronRight size={12} className="ml-auto" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[rgba(82,183,136,0.08)]">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-[rgba(82,183,136,0.1)] flex items-center justify-center text-[#52B788] text-xs font-bold flex-shrink-0">
            {user.name?.charAt(0) ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#E8F5EE] text-xs font-medium truncate">{user.name}</p>
            <p className="text-[#5A8A6A] text-[10px] truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
