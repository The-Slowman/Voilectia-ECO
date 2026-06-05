'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Pencil, Check, X, MessageSquare, Briefcase, User, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

interface Job { id: string; name: string; icon: string | null; color: string; description: string | null }
interface PlayerUser {
  id: string; username: string; email: string; avatar: string | null
  ecoName: string | null; discordTag: string | null; bio: string | null
  job: Job | null
  playerRank: { name: string; color: string; badge: string | null } | null
  lastLoginAt: string | null
}

export default function ProfilPage() {
  const router = useRouter()
  const [user,    setUser]    = useState<PlayerUser | null>(null)
  const [jobs,    setJobs]    = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [draft,   setDraft]   = useState({ discordTag: '', ecoName: '', bio: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/player/auth/me').then(r => r.json()),
      fetch('/api/jobs').then(r => r.json()),
    ]).then(([u, j]) => {
      setUser(u)
      setJobs(j)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function startEdit() {
    if (!user) return
    setDraft({ discordTag: user.discordTag ?? '', ecoName: user.ecoName ?? '', bio: user.bio ?? '' })
    setEditing(true)
  }

  async function saveProfile() {
    setSaving(true)
    try {
      const res = await fetch('/api/player/auth/update', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(draft),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur.'); return }
      setUser(u => u ? { ...u, ...data } : null)
      toast.success('Profil mis à jour !')
      setEditing(false)
    } catch { toast.error('Erreur réseau.') }
    finally { setSaving(false) }
  }

  async function selectJob(jobId: string) {
    const newJobId = user?.job?.id === jobId ? null : jobId
    const res = await fetch('/api/player/auth/update', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ jobId: newJobId }),
    })
    const data = await res.json()
    if (res.ok) {
      setUser(u => u ? { ...u, job: data.job } : null)
      toast.success(newJobId ? `Métier : ${data.job?.name}` : 'Métier retiré.')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1A3D2B] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-[#F2E8D5] flex flex-col items-center justify-center gap-6 px-4">
      <User size={48} className="text-[#9AB09A]" />
      <div className="text-center">
        <h1 className="font-display font-bold text-2xl text-[#1A3D2B] mb-2">Accès réservé</h1>
        <p className="text-[#4A6854] text-sm mb-6">Connecte-toi pour accéder à ton profil.</p>
        <Link href="/connexion" className="btn-primary inline-flex">
          <LogIn size={16} /> Se connecter
        </Link>
      </div>
    </div>
  )

  return (
    <div className="bg-[#F2E8D5] min-h-screen">
      {/* Banner */}
      <div className="bg-[#1A3D2B] pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C1F14] to-transparent opacity-50" />
        <div className="absolute inset-0 bg-forest-texture opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-end gap-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#D4A820] flex-shrink-0 bg-[#2D6A4F] flex items-center justify-center">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.username} fill className="object-cover" />
              ) : (
                <span className="font-display font-bold text-3xl text-[#F2E8D5]">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="font-display font-black text-3xl text-[#F2E8D5]">{user.username}</h1>
                {user.playerRank && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full border"
                        style={{ background: `${user.playerRank.color}20`, color: user.playerRank.color, borderColor: `${user.playerRank.color}40` }}>
                    {user.playerRank.badge} {user.playerRank.name}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[rgba(242,232,213,0.6)]">
                {user.ecoName    && <span>🎮 {user.ecoName}</span>}
                {user.discordTag && <span>💬 {user.discordTag}</span>}
                {user.job && (
                  <span className="font-semibold" style={{ color: user.job.color }}>
                    {user.job.icon} {user.job.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20 space-y-6">

        {/* Infos profil */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-[#1A3D2B] text-base flex items-center gap-2">
              <User size={16} /> Informations
            </h2>
            {!editing ? (
              <button onClick={startEdit} className="btn-ghost btn-sm flex items-center gap-1.5">
                <Pencil size={13} /> Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={saveProfile} disabled={saving}
                        className="btn-primary btn-sm flex items-center gap-1.5">
                  <Check size={13} /> {saving ? 'Sauvegarde…' : 'Sauvegarder'}
                </button>
                <button onClick={() => setEditing(false)} className="btn-ghost btn-sm">
                  <X size={13} />
                </button>
              </div>
            )}
          </div>

          {!editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#4A6854] text-xs mb-0.5">Pseudo</p>
                <p className="font-semibold text-[#1A3D2B]">{user.username}</p>
              </div>
              <div>
                <p className="text-[#4A6854] text-xs mb-0.5">Email</p>
                <p className="font-semibold text-[#1A3D2B]">{user.email}</p>
              </div>
              <div>
                <p className="text-[#4A6854] text-xs mb-0.5">Pseudo Eco</p>
                <p className="font-semibold text-[#1A3D2B]">{user.ecoName ?? <span className="text-[#9AB09A] font-normal italic">Non renseigné</span>}</p>
              </div>
              <div>
                <p className="text-[#4A6854] text-xs mb-0.5">Discord</p>
                <p className="font-semibold text-[#1A3D2B]">{user.discordTag ?? <span className="text-[#9AB09A] font-normal italic">Non renseigné</span>}</p>
              </div>
              {user.bio && (
                <div className="sm:col-span-2">
                  <p className="text-[#4A6854] text-xs mb-0.5">Bio</p>
                  <p className="text-[#1A3D2B] leading-relaxed">{user.bio}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2D5A3F] mb-1">Pseudo Eco</label>
                  <input value={draft.ecoName} onChange={e => setDraft(d => ({ ...d, ecoName: e.target.value }))}
                         className="input" placeholder="Ton pseudo in-game" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2D5A3F] mb-1">Discord</label>
                  <input value={draft.discordTag} onChange={e => setDraft(d => ({ ...d, discordTag: e.target.value }))}
                         className="input" placeholder="@tonpseudo" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2D5A3F] mb-1">Bio</label>
                <textarea value={draft.bio} onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                          className="input resize-none" rows={3} placeholder="Décris-toi en quelques mots…" />
              </div>
            </div>
          )}
        </div>

        {/* Sélecteur de métier */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-[#1A3D2B] text-base flex items-center gap-2 mb-4">
            <Briefcase size={16} /> Mon métier
          </h2>
          {jobs.length === 0 ? (
            <p className="text-[#4A6854] text-sm italic">Aucun métier disponible pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {jobs.map(job => {
                const selected = user.job?.id === job.id
                return (
                  <button key={job.id} onClick={() => selectJob(job.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            selected
                              ? 'border-[#D4A820] bg-[rgba(212,168,32,0.08)]'
                              : 'border-[var(--color-border)] hover:border-[#52B788] hover:bg-[rgba(82,183,136,0.04)]'
                          }`}>
                    <div className="text-2xl mb-1">{job.icon ?? '🔧'}</div>
                    <p className="font-semibold text-sm" style={{ color: selected ? '#D4A820' : '#1A3D2B' }}>
                      {job.name}
                    </p>
                    {job.description && (
                      <p className="text-[10px] text-[#4A6854] mt-0.5 line-clamp-2">{job.description}</p>
                    )}
                    {selected && <span className="text-[10px] text-[#D4A820] font-semibold">✓ Sélectionné</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Accès rapide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/messagerie"
                className="card-hover p-5 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-[rgba(82,183,136,0.1)] text-[#52B788] flex items-center justify-center group-hover:bg-[rgba(82,183,136,0.18)] transition-colors">
              <MessageSquare size={22} />
            </div>
            <div>
              <p className="font-display font-semibold text-[#1A3D2B] text-sm">Messagerie</p>
              <p className="text-[#4A6854] text-xs">Messages privés et canaux</p>
            </div>
          </Link>
          <Link href="/forum"
                className="card-hover p-5 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-[rgba(82,183,136,0.1)] text-[#52B788] flex items-center justify-center group-hover:bg-[rgba(82,183,136,0.18)] transition-colors">
              <span className="text-xl">💬</span>
            </div>
            <div>
              <p className="font-display font-semibold text-[#1A3D2B] text-sm">Forum</p>
              <p className="text-[#4A6854] text-xs">Discussions communautaires</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  )
}
