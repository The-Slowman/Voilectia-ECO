'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

// Rôles qui donnent accès au panel admin
const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'ANIMATOR', 'DEVELOPER', 'EDITOR']

export function AdminAccessButton() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Affiche le bouton uniquement si une session admin valide existe.
    fetch('/api/admin/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d?.role && ADMIN_ROLES.includes(d.role)) setIsAdmin(true)
      })
      .catch(() => {})
  }, [])

  if (!isAdmin) return null

  return (
    <Link
      href="/admin"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                 bg-[rgba(212,168,32,0.15)] hover:bg-[rgba(212,168,32,0.25)]
                 text-[#D4A820] border border-[rgba(212,168,32,0.3)]
                 transition-all"
      title="Accès au panel administrateur"
    >
      <ShieldCheck size={13} />
      <span className="hidden sm:inline">Admin</span>
    </Link>
  )
}
