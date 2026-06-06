'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search, Ban, CheckCircle, Briefcase, Award, Trash2,
  ChevronLeft, ChevronRight, X, Filter, Download,
  UserX, UserCheck, Shield, AlertTriangle, RefreshCw,
  ExternalLink, Clock, Mail, Hash,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { BannedBadge, RoleBadge } from '@/components/admin/AdminBadge'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

interface Job        { name: string; icon: string | null; color: string }
interface PlayerRank { name: string; color: string; badge: string | null }
interface Member {
  id: string; name: string; email: string; role: string; avatar: string | null
  ecoName: string | null; discordTag: string | null
  createdAt: string; lastLoginAt: string | null; banned: boolean
  job: Job | null; playerRank: PlayerRank | null
}
interface JobOpt        { id: string; name: string; icon: string | null; color: string }
interface PlayerRankOpt { id: string; name: string; color: string; badge: string | null }

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtRelative(d: string | null) {
  if (!d) return '—'
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Aujourd\'hui'
  if (days === 1) return 'Hier'
  if (days < 7) return `Il y a ${days}j`
  if (days < 30) return `Il y a ${Math.floor(days / 7)}sem`
  if (days < 365) return `Il y a ${Math.floor(days / 30)}mois`
  return `Il y a ${Math.floor(days / 365)}an`
}

function Avatar({ member }: { member: Pick<Member, 'name' | 'avatar'> }) {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 9,
      background: 'var(--adm-accent-sub)',
      border: '1px solid var(--adm-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
      fontSize: 13, fontWeight: 700, color: 'var(--adm-accent)',
    }}>
      {member.avatar
        ? <Image src={member.avatar} alt={member.name} width={34} height={34} style={{ objectFit: 'cover' }} />
        : member.name.charAt(0).toUpperCase()
      }
    </div>
  )
}

/* ── Secure Delete Modal ─────────────────────────────────── */
function DeleteModal({ member, onConfirm, onCancel }: {
  member: Member
  onConfirm: (mode: 'ban' | 'delete') => void
  onCancel: () => void
}) {
  return (
    <div className="adm-overlay" onClick={onCancel}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--adm-red-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-red)', flexShrink: 0 }}>
              <AlertTriangle size={16} />
            </div>
            <span className="adm-modal-title">Supprimer le compte</span>
          </div>
          <button onClick={onCancel} className="adm-btn adm-btn-ghost adm-btn-icon"><X size={14} /></button>
        </div>
        <div className="adm-modal-body">
          <div className="adm-danger-zone">
            ⚠️ Cette action est réservée au Super Admin. La suppression est définitive et irréversible.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--adm-border-muted)', marginBottom: 12 }}>
            <Avatar member={member} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--adm-text-1)', fontSize: 14 }}>{member.name}</div>
              <div style={{ fontSize: 12, color: 'var(--adm-text-3)' }}>{member.email}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--adm-text-2)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--adm-text-3)', minWidth: 130 }}>Pseudo Eco</span><span>{member.ecoName ?? '—'}</span></div>
            <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--adm-text-3)', minWidth: 130 }}>Inscription</span><span>{fmtDate(member.createdAt)}</span></div>
            <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--adm-text-3)', minWidth: 130 }}>Dernière connexion</span><span>{fmtDate(member.lastLoginAt)}</span></div>
            <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--adm-text-3)', minWidth: 130 }}>Rôle</span><span><RoleBadge role={member.role} /></span></div>
          </div>
        </div>
        <div className="adm-modal-footer" style={{ flexDirection: 'column', gap: 8 }}>
          <button onClick={() => onConfirm('ban')} className="adm-btn adm-btn-warning" style={{ width: '100%', justifyContent: 'center' }}>
            <UserX size={13} /> Désactiver uniquement (bannir)
          </button>
          <button onClick={() => onConfirm('delete')} className="adm-btn adm-btn-danger" style={{ width: '100%', justifyContent: 'center' }}>
            <Trash2 size={13} /> Supprimer définitivement
          </button>
          <button onClick={onCancel} className="adm-btn adm-btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Bulk Action Bar ─────────────────────────────────────── */
function BulkBar({ count, onBan, onUnban, onClear }: {
  count: number; onBan: () => void; onUnban: () => void; onClear: () => void
}) {
  return (
    <div className="adm-bulk-bar" style={{ marginBottom: 12 }}>
      <span style={{ fontWeight: 600 }}>{count} sélectionné{count > 1 ? 's' : ''}</span>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={onBan} className="adm-btn adm-btn-xs adm-btn-warning">
          <UserX size={10} /> Bannir
        </button>
        <button onClick={onUnban} className="adm-btn adm-btn-xs adm-btn-secondary">
          <UserCheck size={10} /> Débannir
        </button>
      </div>
      <button onClick={onClear} className="adm-btn adm-btn-xs adm-btn-ghost" style={{ marginLeft: 'auto' }}>
        <X size={10} /> Désélectionner
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function AdminMembresPage() {
  const [members,    setMembers]    = useState<Member[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all')

  // Selection
  const [selected,   setSelected]   = useState<Set<string>>(new Set())

  // Edit panel
  const [editTarget, setEditTarget] = useState<Member | null>(null)
  const [jobs,       setJobs]       = useState<JobOpt[]>([])
  const [ranks,      setRanks]      = useState<PlayerRankOpt[]>([])
  const [editing,    setEditing]    = useState({ jobId: '', playerRankId: '', ecoName: '', discordTag: '' })

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      search, page: String(page),
      ...(statusFilter !== 'all' && { status: statusFilter }),
    })
    const res  = await fetch(`/api/admin/members?${params}`)
    const data = await res.json()
    setMembers(data.members ?? [])
    setTotalPages(data.pages ?? 1)
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [search, page, statusFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(setJobs)
    fetch('/api/ranks').then(r => r.json()).then(d => setRanks(d.playerRanks ?? []))
  }, [])
  useEffect(() => { setPage(1); setSelected(new Set()) }, [search, statusFilter])

  const allSelected = members.length > 0 && members.every(m => selected.has(m.id))

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(members.map(m => m.id)))
  }
  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function openEdit(m: Member) {
    setEditTarget(m)
    setEditing({
      jobId:        jobs.find(j => j.name === m.job?.name)?.id ?? '',
      playerRankId: ranks.find(r => r.name === m.playerRank?.name)?.id ?? '',
      ecoName:      m.ecoName    ?? '',
      discordTag:   m.discordTag ?? '',
    })
  }

  async function saveEdits() {
    if (!editTarget) return
    const res = await fetch(`/api/admin/members/${editTarget.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    if (res.ok) { toast.success('Membre mis à jour'); load(); setEditTarget(null) }
    else toast.error('Erreur lors de la mise à jour')
  }

  async function toggleBan(m: Member, targetBanned?: boolean) {
    const ban = targetBanned ?? !m.banned
    const res = await fetch(`/api/admin/members/${m.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ banned: ban }),
    })
    if (res.ok) { toast.success(ban ? `${m.name} banni` : `${m.name} débanni`); load() }
    else toast.error('Erreur')
  }

  async function bulkBan(ban: boolean) {
    let ok = 0
    for (const id of selected) {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned: ban }),
      })
      if (res.ok) ok++
    }
    toast.success(`${ok} membre${ok > 1 ? 's' : ''} ${ban ? 'bannis' : 'débannis'}`)
    setSelected(new Set())
    load()
  }

  async function handleDeleteConfirm(mode: 'ban' | 'delete') {
    if (!deleteTarget) return
    if (mode === 'ban') {
      await toggleBan(deleteTarget, true)
    } else {
      const res = await fetch(`/api/admin/members/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Compte supprimé définitivement'); load() }
      else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? 'Réservé au Super Admin')
      }
    }
    setDeleteTarget(null)
    if (editTarget?.id === deleteTarget.id) setEditTarget(null)
  }

  const exportCSV = () => {
    const rows = [
      ['Pseudo', 'Email', 'Pseudo Eco', 'Discord', 'Rôle', 'Statut', 'Inscription', 'Dernière connexion'].join(','),
      ...members.map(m => [
        m.name, m.email, m.ecoName ?? '', m.discordTag ?? '', m.role,
        m.banned ? 'Banni' : 'Actif',
        new Date(m.createdAt).toLocaleDateString('fr-FR'),
        m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleDateString('fr-FR') : '',
      ].map(v => `"${v}"`).join(','))
    ].join('\n')
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'membres.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.success('Export CSV téléchargé')
  }

  return (
    <div className="adm-fade-in">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">👥 Membres</h1>
          <p className="adm-page-subtitle">{total} joueur{total !== 1 ? 's' : ''} inscrit{total !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/admin/membres/inactifs" className="adm-btn adm-btn-ghost adm-btn-sm">
            <Clock size={13} /> Inactifs
          </Link>
          <button onClick={exportCSV} className="adm-btn adm-btn-ghost adm-btn-sm">
            <Download size={13} /> Exporter CSV
          </button>
          <button onClick={load} className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" title="Rafraîchir">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-3)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pseudo, email, pseudo Eco, Discord…"
            className="adm-input"
            style={{ paddingLeft: 32 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'active', 'banned'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`adm-btn adm-btn-sm ${statusFilter === s ? 'adm-btn-secondary' : 'adm-btn-ghost'}`}
              style={statusFilter === s ? { borderColor: 'var(--adm-accent)', color: 'var(--adm-accent)' } : {}}
            >
              {s === 'all' ? '🌐 Tous' : s === 'active' ? '🟢 Actifs' : '🔴 Bannis'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bulk bar ─────────────────────────────────────── */}
      {selected.size > 0 && (
        <BulkBar
          count={selected.size}
          onBan={() => bulkBan(true)}
          onUnban={() => bulkBan(false)}
          onClear={() => setSelected(new Set())}
        />
      )}

      {/* ── Table ────────────────────────────────────────── */}
      {loading ? (
        <div className="adm-table-wrap" style={{ padding: '40px 24px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div className="adm-skeleton" style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="adm-skeleton" style={{ height: 13, width: '40%' }} />
                <div className="adm-skeleton" style={{ height: 11, width: '60%' }} />
              </div>
              <div className="adm-skeleton" style={{ height: 20, width: 60, borderRadius: 20 }} />
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="adm-table-wrap">
          <AdminEmptyState
            icon="👥"
            title={search ? `Aucun résultat pour « ${search} »` : 'Aucun membre inscrit'}
            desc={search ? 'Essayez un autre terme de recherche.' : 'Les joueurs inscrits apparaîtront ici.'}
          />
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th className="adm-col-xs">
                  <input
                    type="checkbox"
                    className="adm-checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    title="Tout sélectionner"
                  />
                </th>
                <th>Joueur</th>
                <th className="adm-col-lg">Pseudo Eco</th>
                <th className="adm-col-lg">Discord</th>
                <th>Métier / Rang</th>
                <th className="adm-col-lg">Inscription</th>
                <th>Connexion</th>
                <th>Statut</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr
                  key={m.id}
                  className={selected.has(m.id) ? 'selected' : ''}
                >
                  <td className="adm-col-xs" onClick={e => { e.stopPropagation(); toggleOne(m.id) }}>
                    <input
                      type="checkbox"
                      className="adm-checkbox"
                      checked={selected.has(m.id)}
                      onChange={() => toggleOne(m.id)}
                    />
                  </td>
                  <td style={{ cursor: 'pointer' }} onClick={() => openEdit(m)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar member={m} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--adm-text-1)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                          {m.name}
                          {m.banned && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--adm-red)', display: 'inline-block' }} />}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--adm-text-3)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={9} /> {m.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="adm-col-lg" style={{ fontSize: 12, color: 'var(--adm-text-2)' }}>
                    {m.ecoName ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Hash size={10} style={{ opacity: 0.5 }} />{m.ecoName}
                      </span>
                    ) : <span style={{ color: 'var(--adm-text-4)' }}>—</span>}
                  </td>
                  <td className="adm-col-lg" style={{ fontSize: 12, color: 'var(--adm-text-2)' }}>
                    {m.discordTag ?? <span style={{ color: 'var(--adm-text-4)' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {m.job && (
                        <span className="adm-badge" style={{ background: `${m.job.color}22`, color: m.job.color, fontSize: 10 }}>
                          {m.job.icon} {m.job.name}
                        </span>
                      )}
                      {m.playerRank && (
                        <span className="adm-badge" style={{ background: `${m.playerRank.color}22`, color: m.playerRank.color, fontSize: 10 }}>
                          {m.playerRank.badge} {m.playerRank.name}
                        </span>
                      )}
                      {!m.job && !m.playerRank && <span style={{ color: 'var(--adm-text-4)', fontSize: 12 }}>—</span>}
                    </div>
                  </td>
                  <td className="adm-col-lg" style={{ fontSize: 12, color: 'var(--adm-text-3)' }}>
                    {fmtDate(m.createdAt)}
                  </td>
                  <td style={{ fontSize: 12, color: m.lastLoginAt ? 'var(--adm-text-2)' : 'var(--adm-text-4)' }}>
                    {fmtRelative(m.lastLoginAt)}
                  </td>
                  <td><BannedBadge banned={m.banned} /></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => toggleBan(m)}
                        className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-xs"
                        title={m.banned ? 'Débannir' : 'Bannir'}
                        style={{ color: m.banned ? 'var(--adm-accent)' : 'var(--adm-red)' }}
                      >
                        {m.banned ? <UserCheck size={12} /> : <UserX size={12} />}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(m)}
                        className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-xs"
                        title="Supprimer"
                        style={{ color: 'var(--adm-red)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="adm-pagination">
            <span>{total} membre{total !== 1 ? 's' : ''} · Page {page} / {totalPages}</span>
            <div className="adm-pagination-pages">
              <button
                className="adm-pagination-btn"
                disabled={page === 1}
                onClick={() => setPage(1)}
                title="Première"
              >«</button>
              <button
                className="adm-pagination-btn"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              ><ChevronLeft size={12} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i))
                return (
                  <button
                    key={p}
                    className={`adm-pagination-btn${page === p ? ' active' : ''}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                )
              })}
              <button
                className="adm-pagination-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              ><ChevronRight size={12} /></button>
              <button
                className="adm-pagination-btn"
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                title="Dernière"
              >»</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit panel (slide-in) ─────────────────────────── */}
      {editTarget && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" style={{ backdropFilter: 'blur(2px)' }} onClick={() => setEditTarget(null)} />
          <div style={{
            position: 'fixed', right: 0, top: 0, height: '100%', width: '100%', maxWidth: 400,
            background: 'var(--adm-sidebar)', borderLeft: '1px solid var(--adm-border-strong)',
            zIndex: 50, overflowY: 'auto', padding: 24,
            boxShadow: 'var(--adm-shadow-lg)',
            animation: 'adm-slide-in 0.22s ease',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar member={editTarget} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--adm-text-1)', fontSize: 14 }}>{editTarget.name}</div>
                  <BannedBadge banned={editTarget.banned} />
                </div>
              </div>
              <button onClick={() => setEditTarget(null)} className="adm-btn adm-btn-ghost adm-btn-icon">
                <X size={14} />
              </button>
            </div>

            {/* Info card */}
            <div className="adm-card" style={{ padding: '12px 16px', marginBottom: 20 }}>
              <div className="adm-info-row">
                <span className="adm-info-key">Email</span>
                <span className="adm-info-value" style={{ fontSize: 12 }}>{editTarget.email}</span>
              </div>
              {editTarget.ecoName && (
                <div className="adm-info-row">
                  <span className="adm-info-key">Pseudo Eco</span>
                  <span className="adm-info-value">{editTarget.ecoName}</span>
                </div>
              )}
              {editTarget.discordTag && (
                <div className="adm-info-row">
                  <span className="adm-info-key">Discord</span>
                  <span className="adm-info-value">{editTarget.discordTag}</span>
                </div>
              )}
              <div className="adm-info-row">
                <span className="adm-info-key">Inscription</span>
                <span className="adm-info-value">{fmtDate(editTarget.createdAt)}</span>
              </div>
              <div className="adm-info-row">
                <span className="adm-info-key">Dernière connexion</span>
                <span className="adm-info-value">
                  {editTarget.lastLoginAt ? `${fmtDate(editTarget.lastLoginAt)} (${fmtRelative(editTarget.lastLoginAt)})` : '—'}
                </span>
              </div>
            </div>

            {/* Edit fields */}
            <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--adm-text-4)', marginBottom: 12 }}>
              Modifier
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="adm-label">Pseudo Eco</label>
                <input
                  value={editing.ecoName}
                  onChange={e => setEditing(p => ({ ...p, ecoName: e.target.value }))}
                  className="adm-input" placeholder="Pseudo in-game"
                />
              </div>
              <div>
                <label className="adm-label">Discord</label>
                <input
                  value={editing.discordTag}
                  onChange={e => setEditing(p => ({ ...p, discordTag: e.target.value }))}
                  className="adm-input" placeholder="@pseudo"
                />
              </div>
              <div>
                <label className="adm-label"><Briefcase size={10} style={{ display: 'inline', marginRight: 4 }} />Métier</label>
                <select
                  value={editing.jobId}
                  onChange={e => setEditing(p => ({ ...p, jobId: e.target.value }))}
                  className="adm-input adm-select"
                >
                  <option value="">— Aucun métier —</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.icon} {j.name}</option>)}
                </select>
              </div>
              <div>
                <label className="adm-label"><Award size={10} style={{ display: 'inline', marginRight: 4 }} />Rang in-game</label>
                <select
                  value={editing.playerRankId}
                  onChange={e => setEditing(p => ({ ...p, playerRankId: e.target.value }))}
                  className="adm-input adm-select"
                >
                  <option value="">— Aucun rang —</option>
                  {ranks.map(r => <option key={r.id} value={r.id}>{r.badge} {r.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={saveEdits} className="adm-btn adm-btn-primary" style={{ flex: 1 }}>
                Sauvegarder
              </button>
              <button
                onClick={() => toggleBan(editTarget)}
                className={`adm-btn ${editTarget.banned ? 'adm-btn-secondary' : 'adm-btn-warning'}`}
              >
                {editTarget.banned ? <><UserCheck size={13} /> Débannir</> : <><UserX size={13} /> Bannir</>}
              </button>
            </div>
            <button
              onClick={() => setDeleteTarget(editTarget)}
              className="adm-btn adm-btn-danger"
              style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
            >
              <Trash2 size={12} /> Supprimer le compte
            </button>
          </div>
        </>
      )}

      {/* ── Secure delete modal ───────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          member={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
