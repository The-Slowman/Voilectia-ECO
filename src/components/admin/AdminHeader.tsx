'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { ExternalLink, LogOut, Bell } from 'lucide-react'

interface AdminHeaderProps {
  user: { name?: string | null }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-14 bg-[#0C1F14] border-b border-[rgba(82,183,136,0.1)] flex items-center justify-between px-6 flex-shrink-0">
      <div className="text-sm text-[#9DC4AD]">
        Bonjour, <span className="text-[#52B788] font-semibold">{user.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-[#9DC4AD] hover:text-[#52B788] transition-colors px-3 py-1.5 rounded-lg hover:bg-[rgba(82,183,136,0.06)]"
        >
          <ExternalLink size={13} />
          Voir le site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-1.5 text-xs text-[#9DC4AD] hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-900/20"
        >
          <LogOut size={13} />
          Déconnexion
        </button>
      </div>
    </header>
  )
}
