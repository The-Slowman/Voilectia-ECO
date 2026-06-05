'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface SteamUser {
  steamId:    string
  username:   string
  avatar:     string
  profileUrl: string
  playerRank: { name: string; color: string; badge: string | null } | null
}

export function SteamLoginButton() {
  const [user,    setUser]    = useState<SteamUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetch('/api/auth/steam/me')
      .then(r => r.json())
      .then(d => { setUser(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const error = searchParams.get('steam_error')
    if (!error) return
    const messages: Record<string, string> = {
      invalid_id:          'ID Steam invalide. Réessayez.',
      invalid_signature:   'Échec de vérification Steam. Réessayez.',
      profile_fetch_failed:'Impossible de récupérer votre profil Steam.',
    }
    toast.error(messages[error] ?? 'Erreur lors de la connexion Steam.')
    // Supprimer le param de l'URL sans rechargement
    const url = new URL(window.location.href)
    url.searchParams.delete('steam_error')
    window.history.replaceState({}, '', url.toString())
  }, [searchParams])

  async function handleLogout() {
    await fetch('/api/auth/steam/logout', { method: 'POST' })
    setUser(null)
    setOpen(false)
  }

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] animate-pulse" />
  }

  if (!user) {
    return (
      <a
        href="/api/auth/steam"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
                   bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)]
                   text-[#F2E8D5] transition-all border border-[rgba(255,255,255,0.1)]"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.455 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.662 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z"/>
        </svg>
        Se connecter
      </a>
    )
  }

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
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-xs font-semibold text-[#F2E8D5] hidden sm:block max-w-[90px] truncate">
          {user.username}
        </span>
        {user.playerRank && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full hidden sm:block"
                style={{ background: `${user.playerRank.color}20`, color: user.playerRank.color }}>
            {user.playerRank.badge} {user.playerRank.name}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-52 bg-[#1A3D2B] border border-[rgba(212,168,32,0.2)]
                          rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-[rgba(255,255,255,0.06)]">
              <p className="text-xs font-bold text-[#F2E8D5]">{user.username}</p>
              <p className="text-[10px] text-[#5A8A6A] font-mono">{user.steamId}</p>
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
