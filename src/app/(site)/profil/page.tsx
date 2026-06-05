'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Link2, Link2Off, Shield, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

interface SteamUser {
  steamId:    string
  username:   string
  avatar:     string
  profileUrl: string
  playerRank: { name: string; color: string; badge: string | null } | null
}

export default function ProfilPage() {
  const [user,    setUser]    = useState<SteamUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState(false)

  useEffect(() => {
    fetch('/api/auth/steam/me')
      .then(r => r.json())
      .then(d => { setUser(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleLinkAdmin() {
    setLinking(true)
    try {
      const res = await fetch('/api/auth/steam/link', { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Erreur lors de la liaison.')
        return
      }
      toast.success('Compte Steam lié à votre compte admin !')
    } catch {
      toast.error('Erreur réseau.')
    } finally {
      setLinking(false)
    }
  }

  async function handleUnlinkAdmin() {
    if (!confirm('Délier votre compte Steam ?')) return
    await fetch('/api/auth/steam/link', { method: 'DELETE' })
    toast.success('Compte Steam délié.')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#1A3D2B] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-[#F2E8D5] flex flex-col items-center justify-center gap-6 px-4">
      <Shield size={48} className="text-[#9AB09A]" />
      <div className="text-center">
        <h1 className="font-display font-bold text-2xl text-[#1A3D2B] mb-2">Connectez-vous avec Steam</h1>
        <p className="text-[#6B8C6A] text-sm mb-6">
          Pour accéder à votre profil Voilectia, connectez-vous via votre compte Steam.
        </p>
        <a href="/api/auth/steam"
           className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white
                      bg-[#1A3D2B] hover:bg-[#2D6A4F] transition-colors">
          <LogIn size={18} /> Se connecter avec Steam
        </a>
      </div>
    </div>
  )

  return (
    <div className="bg-[#F2E8D5] min-h-screen">
      <div className="bg-[#1A3D2B] pt-24 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C1F14] to-transparent opacity-50" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-end gap-5">
            {user.avatar && (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#D4A820] flex-shrink-0">
                <Image src={user.avatar} alt={user.username} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="font-display font-black text-3xl text-[#F2E8D5]">{user.username}</h1>
                {user.playerRank && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full border"
                        style={{
                          background:  `${user.playerRank.color}20`,
                          color:       user.playerRank.color,
                          borderColor: `${user.playerRank.color}40`,
                        }}>
                    {user.playerRank.badge} {user.playerRank.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[rgba(242,232,213,0.4)] text-xs font-mono">{user.steamId}</span>
                <a href={user.profileUrl} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-xs text-[rgba(242,232,213,0.5)]
                              hover:text-[#F2E8D5] transition-colors">
                  <ExternalLink size={11} /> Profil Steam
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20 space-y-6">

        {/* Stats de participation */}
        <div className="bg-white border border-[#DBCAA8] rounded-xl p-5">
          <h2 className="font-display font-bold text-[#1A3D2B] text-base mb-4">Votre activité</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Sondages',     value: '—' },
              { label: 'Suggestions',  value: '—' },
              { label: 'Forum',        value: '—' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-display font-bold text-2xl text-[#1A3D2B]">{s.value}</div>
                <div className="text-xs text-[#9AB09A]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Liaison compte admin */}
        <div className="bg-white border border-[#DBCAA8] rounded-xl p-5">
          <h2 className="font-display font-bold text-[#1A3D2B] text-base mb-2 flex items-center gap-2">
            <Shield size={16} className="text-[#D4A820]" />
            Liaison compte admin
          </h2>
          <p className="text-sm text-[#6B8C6A] mb-4">
            Si vous avez un compte admin Voilectia, vous pouvez lier votre Steam pour vous y connecter directement.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLinkAdmin}
              disabled={linking}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                         bg-[#1A3D2B] text-white hover:bg-[#2D6A4F] transition-colors disabled:opacity-50"
            >
              <Link2 size={14} />
              {linking ? 'Liaison…' : 'Lier mon compte admin'}
            </button>
            <button
              onClick={handleUnlinkAdmin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                         border border-[#DBCAA8] text-[#6B8C6A] hover:text-red-500 hover:border-red-200
                         transition-colors"
            >
              <Link2Off size={14} /> Délier
            </button>
          </div>
          <p className="text-xs text-[#9AB09A] mt-2">
            Vous devez être connecté à votre compte admin dans le même navigateur.
          </p>
        </div>

      </div>
    </div>
  )
}
