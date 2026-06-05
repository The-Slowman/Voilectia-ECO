'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Ban, CheckCircle, Briefcase, Award, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Job        { name: string; icon: string | null; color: string }
interface PlayerRank { name: string; color: string; badge: string | null }
interface Member {
  id: string; name: string; email: string; avatar: string | null
  ecoName: string | null; discordTag: string | null
  createdAt: string; lastLoginAt: string | null; banned: boolean
  job: Job | null; playerRank: PlayerRank | null
}
interface JobOpt        { id: string; name: string; icon: string | null; color: string }
interface PlayerRankOpt { id: string; name: string; color: string; badge: string | null }

export default function AdminMembresPage() {
  const [members,      setMembers]      = useState<Member[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [page,         setPage]         = useState(1)
  const [totalPages,   setTotalPages]   = useState(1)
  const [total,        setTotal]        = useState(0)
  const [selected,     setSelected]     = useState<Member | null>(null)
  const [jobs,         setJobs]         = useState<JobOpt[]>([])
  const [ranks,        setRanks]        = useState<PlayerRankOpt[]>([])
  const [editing,      setEditing]      = useState({ jobId: '', playerRankId: '', ecoName: '', discordTag: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch(`/api/admin/members?search=${encodeURIComponent(search)}&page=${page}`)
    const data = await res.json()
    setMembers(data.members ?? [])
    setTotalPages(data.pages ?? 1)
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [search, page])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(setJobs)
    fetch('/api/ranks').then(r => r.json()).then(d => setRanks(d.playerRanks ?? []))
  }, [])

  // Réinitialise la page quand on cherche
  useEffect(() => { setPage(1) }, [search])

  function openMember(m: Member) {
    setSelected(m)
    setEditing({
      jobId:        m.job?.name        ? jobs.find(j => j.name === m.job?.name)?.id ?? '' : '',
      playerRankId: m.playerRank?.name ? ranks.find(r => r.name === m.playerRank?.name)?.id ?? '' : '',
      ecoName:      m.ecoName    ?? '',
      discordTag:   m.discordTag ?? '',
    })
  }

  async function saveEdits() {
    if (!selected) return
    const res = await fetch(`/api/admin/members/${selected.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(editing),
    })
    if (res.ok) { toast.success('Membre mis à jour.'); load(); setSelected(null) }
    else toast.error('Erreur.')
  }

  async function toggleBan(m: Member) {
    if (!confirm(m.banned ? `Débannir ${m.name} ?` : `Bannir ${m.name} ?`)) return
    const res = await fetch(`/api/admin/members/${m.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ banned: !m.banned }),
    })
    if (res.ok) { toast.success(m.banned ? 'Membre débanni.' : 'Membre banni.'); load() }
    else toast.error('Erreur.')
  }

  async function deleteMember(m: Member) {
    if (!confirm(`Supprimer définitivement le compte de ${m.name} ? Cette action est irréversible.`)) return
    const res = await fetch(`/api/admin/members/${m.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Compte supprimé.'); load(); setSelected(null) }
    else toast.error('Réservé au Super Admin.')
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#E8F5EE]">Gestion des membres</h1>
          <p className="text-[#9DC4AD] text-sm mt-1">{total} joueur{total > 1 ? 's' : ''} inscrit{total > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A8A6A]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
               placeholder="Rechercher par pseudo, email, pseudo Eco…"
               className="input-dark pl-9 w-full" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="card-dark p-12 text-center text-[#5A8A6A]">Aucun membre trouvé.</div>
      ) : (
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id}
                 className={`card-dark p-4 flex items-center gap-3 cursor-pointer hover:border-[rgba(82,183,136,0.3)] transition-colors ${m.banned ? 'opacity-60' : ''}`}
                 onClick={() => openMember(m)}>
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[rgba(82,183,136,0.1)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {m.avatar
                  ? <Image src={m.avatar} alt={m.name} width={40} height={40} className="object-cover" />
                  : <span className="font-bold text-[#52B788]">{m.name.charAt(0).toUpperCase()}</span>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[#E8F5EE] text-sm">{m.name}</span>
                  {m.banned && <span className="text-[10px] bg-red-900/40 text-red-400 px-1.5 py-0.5 rounded-full">Banni</span>}
                  {m.job && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ background: `${m.job.color}20`, color: m.job.color }}>
                      {m.job.icon} {m.job.name}
                    </span>
                  )}
                  {m.playerRank && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ background: `${m.playerRank.color}20`, color: m.playerRank.color }}>
                      {m.playerRank.badge} {m.playerRank.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5A8A6A] truncate">{m.email}{m.ecoName ? ` · 🎮 ${m.ecoName}` : ''}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <button onClick={() => toggleBan(m)}
                        className={`p-1.5 rounded-lg transition-colors ${m.banned ? 'text-[#52B788] hover:bg-[rgba(82,183,136,0.1)]' : 'text-[#5A8A6A] hover:bg-red-900/20 hover:text-red-400'}`}
                        title={m.banned ? 'Débannir' : 'Bannir'}>
                  {m.banned ? <CheckCircle size={15} /> : <Ban size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg text-[#9DC4AD] hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-[#9DC4AD]">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg text-[#9DC4AD] hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Panel édition */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0C1F14] border-l border-[rgba(82,183,136,0.15)] z-50 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-[#E8F5EE] text-lg">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-[#5A8A6A] hover:text-[#E8F5EE]">✕</button>
            </div>

            {/* Infos */}
            <div className="space-y-1 text-xs text-[#9DC4AD] mb-6">
              <p>📧 {selected.email}</p>
              {selected.discordTag && <p>💬 {selected.discordTag}</p>}
              <p>📅 Inscrit le {new Date(selected.createdAt).toLocaleDateString('fr-FR')}</p>
              {selected.lastLoginAt && <p>🕐 Dernière connexion : {new Date(selected.lastLoginAt).toLocaleDateString('fr-FR')}</p>}
            </div>

            {/* Édition */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#9DC4AD] mb-1">Pseudo Eco</label>
                <input value={editing.ecoName}
                       onChange={e => setEditing(prev => ({ ...prev, ecoName: e.target.value }))}
                       className="input-dark w-full" placeholder="Pseudo in-game" />
              </div>
              <div>
                <label className="block text-xs text-[#9DC4AD] mb-1">Discord</label>
                <input value={editing.discordTag}
                       onChange={e => setEditing(prev => ({ ...prev, discordTag: e.target.value }))}
                       className="input-dark w-full" placeholder="@pseudo" />
              </div>
              <div>
                <label className="block text-xs text-[#9DC4AD] mb-1 flex items-center gap-1"><Briefcase size={12} /> Métier</label>
                <select value={editing.jobId}
                        onChange={e => setEditing(prev => ({ ...prev, jobId: e.target.value }))}
                        className="input-dark w-full">
                  <option value="">— Aucun métier —</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.icon} {j.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#9DC4AD] mb-1 flex items-center gap-1"><Award size={12} /> Rang in-game</label>
                <select value={editing.playerRankId}
                        onChange={e => setEditing(prev => ({ ...prev, playerRankId: e.target.value }))}
                        className="input-dark w-full">
                  <option value="">— Aucun rang —</option>
                  {ranks.map(r => (
                    <option key={r.id} value={r.id}>{r.badge} {r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={saveEdits}
                      className="flex-1 bg-[#52B788] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3A7A52] transition-colors">
                Sauvegarder
              </button>
              <button onClick={() => toggleBan(selected)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        selected.banned
                          ? 'bg-[rgba(82,183,136,0.1)] text-[#52B788] hover:bg-[rgba(82,183,136,0.2)]'
                          : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                      }`}>
                {selected.banned ? 'Débannir' : 'Bannir'}
              </button>
            </div>

            <button onClick={() => deleteMember(selected)}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-[#5A8A6A] hover:text-red-400 hover:bg-red-900/20 transition-colors">
              <Trash2 size={13} /> Supprimer le compte (Super Admin)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
