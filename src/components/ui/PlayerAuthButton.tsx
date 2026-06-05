'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LogOut, User, MessageSquare, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

interface PlayerUser {
  id: string
  username: string
  avatar: string | null
  ecoName: string | null
  discordTag: string | null
  job: { name: string; icon: string | null; color: string } | null
  playerRank: { name: string; color: string; badge: string | null } | null
}

export function PlayerAuthButton() {
  const [user,    setUser]    = useState<PlayerUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState(false)

  useEffect(() => {
    fetch('/api/player/auth/me')
      .then(r => r.json())
      .then(d => { setUser(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await fetch('/api/player/auth/logout', { method: 'POST' })
    setUser(null)
    setOpen(false)
    toast.success('Déconnecté.')
    window.location.href = '/'
  }

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] animate-pulse" />
  }

  if (!user) {
    return (
      <Link
        href="/connexion"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
                   bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)]
                   text-[#F2E8D5] transition-all border border-[rgba(255,255,255,0.1)]"
      >
        <LogIn size={14} />
        Se connecter
      </Link>
    )
  }

  const initial = user.username.charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[rgba(255,255,255,0.08)]
                   transition-all border border-transparent hover:border-[rgba(255,255,255,0.1)]"
      >
        {user.avatar ? (
          <Image src={user.avatar} alt={user.username} width={28} height={28}
                 className="rounded-full" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#3A7A52] flex items-center justify-center text-xs font-bold text-white">
            {initial}
          </div>
        )}
        <span className="text-xs font-semibold text-[#F2E8D5] hidden sm:block max-w-[90px] truncate">
          {user.username}
        </span>
        {user.job && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full hidden sm:block"
                style={{ background: `${user.job.color}20`, color: user.job.color }}>
            {user.job.icon} {user.job.name}
          </span>
        )}
        {user.playerRank && !user.job && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full hidden sm:block"
                style={{ background: `${user.playerRank.color}20`, color: user.playerRank.color }}>
            {user.playerRank.badge} {user.playerRank.name}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-[#1A3D2B] border border-[rgba(212,168,32,0.2)]
                          rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-[rgba(255,255,255,0.06)]">
              <p className="text-xs font-bold text-[#F2E8D5]">{user.username}</p>
              {user.ecoName && <p className="text-[10px] text-[#5A8A6A]">🎮 {user.ecoName}</p>}
              {user.discordTag && <p className="text-[10px] text-[#5A8A6A]">💬 {user.discordTag}</p>}
              {user.playerRank && (
                <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${user.playerRank.color}20`, color: user.playerRank.color }}>
                  {user.playerRank.badge} {user.playerRank.name}
                </span>
              )}
            </div>
            <Link href="/profil"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#9DC4AD]
                             hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F2E8D5] transition-colors">
              <User size={14} /> Mon profil
            </Link>
            <Link href="/messagerie"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#9DC4AD]
                             hover:bg-[rgba(255,255,255,0.06)] hover:text-[#F2E8D5] transition-colors">
              <MessageSquare size={14} /> Messagerie
            </Link>
            <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400
                               hover:bg-red-900/20 transition-colors">
              <LogOut size={14} /> Se déconnecter
            </button>
          </div>
        </>
      )}
    </div>
  )
}
