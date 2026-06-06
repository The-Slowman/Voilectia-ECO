'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Ban, CheckCircle, Briefcase, Award, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { BannedBadge } from '@/components/admin/AdminBadge'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

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
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    if (res.ok) { toast.success('Membre mis à jour.'); load(); setSelected(null) }
    else toast.error('Erreur.')
  }

  async function toggleBan(m: Member) {
    if (!confirm(m.banned ? `Débannir ${m.name} ?` : `Bannir ${m.name} ?`)) return
    const res = await fetch(`/api/admin/members/${m.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ banned: !m.banned }),
    })
    if (res.ok) { toast.success(m.banned ? 'Membre débanni.' : 'Membre banni.'); load() }
    else toast.error('Erreur.')
  }

  async function deleteMember(m: Member) {
    if (!confirm(`Supprimer définitivement ${m.name} ? Irréversible.`)) return
    const res = await fetch(`/api/admin/members/${m.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Compte supprimé.'); load(); setSelected(null) }
    else toast.error('Réservé au Super Admin.')
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Gestion des membres</h1>
          <p className="adm-page-subtitle">{total} joueur{total !== 1 ? 's' : ''} inscrit{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-3)', pointerEvents: 'none' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
               placeholder="Rechercher par pseudo, email, pseudo Eco…"
               className="adm-input" style={{ paddingLeft: 32 }} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="adm-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ width: 24, height: 24, border: '2px solid var(--adm-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        </div>
      ) : members.length === 0 ? (
        <AdminEmptyState icon="👥" title="Aucun membre trouvé" desc={search ? `Aucun résultat pour « ${search} »` : undefined} />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Joueur</th>
                <th>Métier / Rang</th>
                <th style={{ display: 'none' }} className="adm-col-lg">Inscription</th>
                <th>Statut</th>
                <th style={{ width: 52 }} />
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => openMember(m)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: 'var(--adm-surface-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: 0, fontSize: 13, fontWeight: 700, color: 'var(--adm-accent)',
                      }}>
                        {m.avatar
                          ? <Image src={m.avatar} alt={m.name} width={32} height={32} style={{ objectFit: 'cover' }} />
                          : m.name.charAt(0).toUpperCase()
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--adm-text-1)', fontSize: 13 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--adm-text-3)', marginTop: 1 }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {m.job && (
                        <span className="adm-badge" style={{ background: `${m.job.color}20`, color: m.job.color }}>
                          {m.job.icon} {m.job.name}
                        </span>
                      )}
                      {m.playerRank && (
                        <span className="adm-badge" style={{ background: `${m.playerRank.color}20`, color: m.playerRank.color }}>
                          {m.playerRank.badge} {m.playerRank.name}
                        </span>
                      )}
                      {!m.job && !m.playerRank && <span style={{ color: 'var(--adm-text-3)', fontSize: 12 }}>—</span>}
                    </div>
                  </td>
                  <td style={{ color: 'var(--adm-text-2)', fontSize: 12 }}>
                    {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td><BannedBadge banned={m.banned} /></td>
                  <td onClick={e => e.stopPropagation()}>
                    <button onClick={() => toggleBan(m)} className="adm-btn adm-btn-ghost adm-btn-sm"
                            title={m.banned ? 'Débannir' : 'Bannir'}
                            style={{ color: m.banned ? 'var(--adm-accent)' : 'var(--adm-red)' }}>
                      {m.banned ? <CheckCircle size={13} /> : <Ban size={13} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="adm-btn adm-btn-ghost adm-btn-sm">
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 13, color: 'var(--adm-text-2)' }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="adm-btn adm-btn-ghost adm-btn-sm">
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Slide-in detail panel */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" style={{ backdropFilter: 'blur(2px)' }} onClick={() => setSelected(null)} />
          <div style={{
            position: 'fixed', right: 0, top: 0, height: '100%', width: '100%', maxWidth: 400,
            background: 'var(--adm-sidebar)', borderLeft: '1px solid var(--adm-border)',
            zIndex: 50, overflowY: 'auto', padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'var(--adm-surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', fontSize: 14, fontWeight: 700, color: 'var(--adm-accent)',
                }}>
                  {selected.avatar
                    ? <Image src={selected.avatar} alt={selected.name} width={36} height={36} style={{ objectFit: 'cover' }} />
                    : selected.name.charAt(0).toUpperCase()
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--adm-text-1)', marginBottom: 3 }}>{selected.name}</div>
                  <BannedBadge banned={selected.banned} />
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="adm-btn adm-btn-ghost adm-btn-sm"><X size={14} /></button>
            </div>

            <div className="adm-card" style={{ padding: '10px 14px', marginBottom: 20, fontSize: 12, color: 'var(--adm-text-2)', lineHeight: 2 }}>
              <div>📧 {selected.email}</div>
              {selected.discordTag && <div>💬 {selected.discordTag}</div>}
              <div>📅 Inscrit le {new Date(selected.createdAt).toLocaleDateString('fr-FR')}</div>
              {selected.lastLoginAt && <div>🕐 Dernière connexion : {new Date(selected.lastLoginAt).toLocaleDateString('fr-FR')}</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'ecoName', label: 'Pseudo Eco', icon: null, placeholder: 'Pseudo in-game' },
                { key: 'discordTag', label: 'Discord', icon: null, placeholder: '@pseudo' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                  <input value={(editing as Record<string, string>)[key]}
                         onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                         className="adm-input" placeholder={placeholder} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <Briefcase size={10} style={{ display: 'inline', marginRight: 3 }} />Métier
                </label>
                <select value={editing.jobId} onChange={e => setEditing(p => ({ ...p, jobId: e.target.value }))} className="adm-input">
                  <option value="">— Aucun métier —</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.icon} {j.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <Award size={10} style={{ display: 'inline', marginRight: 3 }} />Rang in-game
                </label>
                <select value={editing.playerRankId} onChange={e => setEditing(p => ({ ...p, playerRankId: e.target.value }))} className="adm-input">
                  <option value="">— Aucun rang —</option>
                  {ranks.map(r => <option key={r.id} value={r.id}>{r.badge} {r.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={saveEdits} className="adm-btn adm-btn-primary" style={{ flex: 1 }}>Sauvegarder</button>
              <button onClick={() => toggleBan(selected)} className="adm-btn adm-btn-ghost"
                      style={{ color: selected.banned ? 'var(--adm-accent)' : 'var(--adm-red)' }}>
                {selected.banned ? 'Débannir' : 'Bannir'}
              </button>
            </div>
            <button onClick={() => deleteMember(selected)} className="adm-btn adm-btn-danger"
                    style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}>
              <Trash2 size={12} /> Supprimer (Super Admin)
            </button>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
