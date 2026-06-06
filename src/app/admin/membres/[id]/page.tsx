'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Shield, Ban, CheckCircle, Trash2, Edit3,
  User, Calendar, Clock, Hash, MessageSquare, FileText,
  BookOpen, ScrollText, AlertTriangle, Save, X
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────── */
interface UserDetail {
  id: string; name: string; email: string; role: string
  avatar: string | null; ecoName: string | null; discordTag: string | null
  bio: string | null; banned: boolean
  createdAt: string; lastLoginAt: string | null; updatedAt: string
  job:        { id: string; name: string } | null
  playerRank: { id: string; name: string; color: string } | null
  rank:       { id: string; name: string } | null
}
interface AuditEntry {
  id: string; action: string; resource: string; resourceId: string | null
  detail: string | null; ip: string | null; createdAt: string
}
interface Stats { articles: number; guides: number; changelogs: number }

/* ─── Constantes ─────────────────────────────────────────── */
const ROLE_META: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'var(--adm-red)' },
  ADMIN:       { label: 'Administrateur', color: 'var(--adm-orange)' },
  EDITOR:      { label: 'Éditeur', color: 'var(--adm-blue)' },
  PLAYER:      { label: 'Joueur', color: 'var(--adm-accent)' },
}

const ACTION_META: Record<string, { label: string; color: string }> = {
  CREATE:     { label: 'Créé',     color: 'var(--adm-accent)'  },
  UPDATE:     { label: 'Modifié',  color: 'var(--adm-blue)'    },
  DELETE:     { label: 'Supprimé', color: 'var(--adm-red)'     },
  BAN:        { label: 'Banni',    color: 'var(--adm-orange)'  },
  UNBAN:      { label: 'Débanni',  color: 'var(--adm-cyan)'    },
  LOGIN:      { label: 'Connecté', color: 'var(--adm-accent)'  },
  LOGOUT:     { label: 'Déco.',    color: 'var(--adm-text-3)'  },
  PUBLISH:    { label: 'Publié',   color: 'var(--adm-purple)'  },
  UNPUBLISH:  { label: 'Dépublié', color: 'var(--adm-gold)'    },
  ROLE_CHANGE:{ label: 'Rôle',     color: 'var(--adm-purple)'  },
}

/* ─── Helpers ────────────────────────────────────────────── */
function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}
function fmtRelative(d: string | null) {
  if (!d) return 'jamais'
  const diff = Date.now() - new Date(d).getTime()
  const mn = Math.floor(diff / 60000)
  if (mn < 1)   return 'à l\'instant'
  if (mn < 60)  return `il y a ${mn}mn`
  const h = Math.floor(mn / 60)
  if (h < 24)   return `il y a ${h}h`
  const j = Math.floor(h / 24)
  if (j < 7)    return `il y a ${j}j`
  return fmtDate(d)
}
function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

/* ─── Composants ─────────────────────────────────────────── */
function InfoRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="adm-info-row">
      <span className="adm-info-key">{label}</span>
      <span className="adm-info-value">{value}</span>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="adm-mini-stat" style={{ flex: 1 }}>
      <div style={{ color, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--adm-text-1)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--adm-text-3)' }}>{label}</div>
    </div>
  )
}

function DeleteModal({ user, onClose, onDeleted }: { user: UserDetail; onClose: () => void; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/admin/members/${user.id}`, { method: 'DELETE' })
    if (res.ok) onDeleted()
    else setLoading(false)
  }

  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-modal adm-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="adm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} style={{ color: 'var(--adm-red)' }} />
            <span>Supprimer le compte</span>
          </div>
          <button onClick={onClose} className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm"><X size={14} /></button>
        </div>
        <div className="adm-modal-body">
          <div className="adm-alert adm-alert-error" style={{ marginBottom: 16 }}>
            Cette action est <strong>irréversible</strong>. Toutes les données liées seront supprimées.
          </div>
          <div className="adm-info-row"><span className="adm-info-key">Nom</span><span className="adm-info-value">{user.name}</span></div>
          <div className="adm-info-row"><span className="adm-info-key">Email</span><span className="adm-info-value">{user.email}</span></div>
          <div className="adm-info-row"><span className="adm-info-key">Pseudo Eco</span><span className="adm-info-value">{user.ecoName ?? '—'}</span></div>
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--adm-text-2)', display: 'block', marginBottom: 6 }}>
              Tapez <strong style={{ color: 'var(--adm-text-1)' }}>{user.name}</strong> pour confirmer :
            </label>
            <input
              className="adm-input"
              style={{ width: '100%' }}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder={user.name}
            />
          </div>
        </div>
        <div className="adm-modal-footer">
          <button onClick={onClose} className="adm-btn adm-btn-ghost adm-btn-sm">Annuler</button>
          <button
            onClick={handleDelete}
            disabled={confirm !== user.name || loading}
            className="adm-btn adm-btn-danger adm-btn-sm"
          >
            {loading ? 'Suppression…' : 'Supprimer définitivement'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Page principale ────────────────────────────────────── */
export default function MembreFichePage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [user,      setUser]      = useState<UserDetail | null>(null)
  const [stats,     setStats]     = useState<Stats>({ articles: 0, guides: 0, changelogs: 0 })
  const [logs,      setLogs]      = useState<AuditEntry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showDel,   setShowDel]   = useState(false)
  const [editMode,  setEditMode]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [editForm,  setEditForm]  = useState({ ecoName: '', discordTag: '', bio: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetch(`/api/admin/members/${id}`).then(r => r.json()).catch(() => null)
    if (data?.user) {
      setUser(data.user)
      setStats(data.stats)
      setLogs(data.auditLogs ?? [])
      setEditForm({
        ecoName:    data.user.ecoName    ?? '',
        discordTag: data.user.discordTag ?? '',
        bio:        data.user.bio        ?? '',
      })
    }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function toggleBan() {
    if (!user) return
    setSaving(true)
    const res = await fetch(`/api/admin/members/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ banned: !user.banned }),
    })
    if (res.ok) { await load() }
    setSaving(false)
  }

  async function saveEdit() {
    if (!user) return
    setSaving(true)
    const res = await fetch(`/api/admin/members/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) { setEditMode(false); await load() }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="adm-fade-in">
        <div className="adm-page-header">
          <div className="adm-skeleton" style={{ height: 22, width: 180 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
          <div className="adm-card adm-skeleton" style={{ height: 360 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="adm-card adm-skeleton" style={{ height: 100 }} />
            <div className="adm-card adm-skeleton" style={{ height: 220 }} />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="adm-fade-in">
        <div className="adm-empty">
          <div className="adm-empty-icon">👤</div>
          <div className="adm-empty-title">Membre introuvable</div>
          <div className="adm-empty-desc">Cet utilisateur n&apos;existe pas ou a été supprimé.</div>
          <button onClick={() => router.push('/admin/membres')} className="adm-btn adm-btn-sm" style={{ marginTop: 12 }}>
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  const roleMeta = ROLE_META[user.role] ?? { label: user.role, color: 'var(--adm-text-3)' }

  return (
    <div className="adm-fade-in">
      {/* Header */}
      <div className="adm-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/admin/membres')} className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm">
            <ArrowLeft size={13} />
          </button>
          <div>
            <h1 className="adm-page-title">{user.name}</h1>
            <p className="adm-page-subtitle">{user.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {editMode ? (
            <>
              <button onClick={() => setEditMode(false)} className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon"><X size={13}/></button>
              <button onClick={saveEdit} disabled={saving} className="adm-btn adm-btn-sm adm-btn-icon" style={{ background: 'var(--adm-accent)', color: '#fff' }}>
                <Save size={13}/> {saving ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditMode(true)} className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon">
                <Edit3 size={13} />
              </button>
              <button
                onClick={toggleBan}
                disabled={saving}
                className={`adm-btn adm-btn-sm adm-btn-icon ${user.banned ? '' : 'adm-btn-danger'}`}
                style={user.banned ? { background: 'var(--adm-accent)', color: '#fff' } : undefined}
              >
                {user.banned ? <><CheckCircle size={13} /> Débannir</> : <><Ban size={13} /> Bannir</>}
              </button>
              {user.role === 'PLAYER' && (
                <button onClick={() => setShowDel(true)} className="adm-btn adm-btn-danger adm-btn-sm adm-btn-icon">
                  <Trash2 size={13} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Statut banni */}
      {user.banned && (
        <div className="adm-alert adm-alert-error" style={{ marginBottom: 16 }}>
          <Ban size={13} style={{ display: 'inline', marginRight: 6 }} />
          Ce compte est <strong>banni</strong> — connexion joueur désactivée.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Colonne gauche — profil */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar + infos de base */}
          <div className="adm-card" style={{ textAlign: 'center', padding: '28px 20px 20px' }}>
            <div className="adm-avatar" style={{ width: 72, height: 72, fontSize: 24, margin: '0 auto 12px', background: 'var(--adm-surface-3)', color: 'var(--adm-text-2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {user.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : initials(user.name)
              }
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--adm-text-1)', marginBottom: 4 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: 'var(--adm-text-3)', marginBottom: 10 }}>{user.email}</div>
            <span className="adm-badge" style={{ background: 'color-mix(in srgb, ' + roleMeta.color + ' 15%, transparent)', color: roleMeta.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Shield size={9} /> {roleMeta.label}
            </span>
            {user.rank && (
              <div style={{ marginTop: 6 }}>
                <span className="adm-badge" style={{ background: 'var(--adm-surface-3)', color: 'var(--adm-text-2)' }}>{user.rank.name}</span>
              </div>
            )}
            {user.banned && (
              <div style={{ marginTop: 8 }}>
                <span className="adm-badge" style={{ background: 'var(--adm-red-sub)', color: 'var(--adm-red)' }}>
                  <Ban size={9} style={{ display: 'inline', marginRight: 3 }} /> Banni
                </span>
              </div>
            )}
          </div>

          {/* Infos joueur */}
          <div className="adm-card">
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--adm-border)' }}>
              Profil joueur
            </div>
            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--adm-text-3)', display: 'block', marginBottom: 4 }}>Pseudo Eco</label>
                  <input className="adm-input" style={{ width: '100%' }} value={editForm.ecoName} onChange={e => setEditForm(p => ({ ...p, ecoName: e.target.value }))} placeholder="Pseudo in-game" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--adm-text-3)', display: 'block', marginBottom: 4 }}>Discord</label>
                  <input className="adm-input" style={{ width: '100%' }} value={editForm.discordTag} onChange={e => setEditForm(p => ({ ...p, discordTag: e.target.value }))} placeholder="pseudo#0000" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--adm-text-3)', display: 'block', marginBottom: 4 }}>Bio</label>
                  <textarea className="adm-input adm-textarea" style={{ width: '100%' }} rows={3} value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} placeholder="Biographie…" />
                </div>
              </div>
            ) : (
              <>
                <InfoRow label="Pseudo Eco" value={user.ecoName ?? <span style={{ color: 'var(--adm-text-4)', fontStyle: 'italic' }}>Non défini</span>} />
                <InfoRow label="Discord" value={user.discordTag ?? <span style={{ color: 'var(--adm-text-4)', fontStyle: 'italic' }}>Non lié</span>} />
                <InfoRow label="Métier" value={user.job ? user.job.name : <span style={{ color: 'var(--adm-text-4)', fontStyle: 'italic' }}>Aucun</span>} />
                {user.playerRank && (
                  <InfoRow label="Rang" value={
                    <span className="adm-badge" style={{ background: 'color-mix(in srgb,' + (user.playerRank.color || '#fff') + ' 15%, transparent)', color: user.playerRank.color || 'inherit' }}>
                      {user.playerRank.name}
                    </span>
                  } />
                )}
                {user.bio && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--adm-text-2)', lineHeight: 1.5, borderTop: '1px solid var(--adm-border)', paddingTop: 10 }}>
                    {user.bio}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Dates */}
          <div className="adm-card">
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--adm-border)' }}>
              Activité
            </div>
            <InfoRow label={<><Calendar size={10} style={{ display: 'inline', marginRight: 4 }} />Inscription</>} value={fmtDate(user.createdAt)} />
            <InfoRow label={<><Clock size={10} style={{ display: 'inline', marginRight: 4 }} />Dernière connexion</>} value={fmtRelative(user.lastLoginAt)} />
            <InfoRow label={<><Hash size={10} style={{ display: 'inline', marginRight: 4 }} />ID</>} value={<span className="adm-mono" style={{ fontSize: 10, color: 'var(--adm-text-4)' }}>{user.id.slice(-8)}</span>} />
          </div>
        </div>

        {/* Colonne droite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 12 }}>
            <StatCard icon={<FileText size={16} />} label="Articles" value={stats.articles} color="var(--adm-blue)" />
            <StatCard icon={<BookOpen size={16} />} label="Guides" value={stats.guides} color="var(--adm-purple)" />
            <StatCard icon={<ScrollText size={16} />} label="Changelogs" value={stats.changelogs} color="var(--adm-accent)" />
          </div>

          {/* Journal d'activité */}
          <div className="adm-card">
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--adm-border)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ScrollText size={11} /> Dernières actions
            </div>
            {logs.length === 0 ? (
              <div className="adm-empty" style={{ padding: '24px 0' }}>
                <div className="adm-empty-icon" style={{ fontSize: 20 }}>📋</div>
                <div className="adm-empty-desc">Aucune action enregistrée.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {logs.map(log => {
                  const meta = ACTION_META[log.action] ?? { label: log.action, color: 'var(--adm-text-3)' }
                  return (
                    <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--adm-border)' }}>
                      <span className="adm-badge" style={{ background: 'color-mix(in srgb,' + meta.color + ' 12%, transparent)', color: meta.color, fontSize: 10, minWidth: 60, textAlign: 'center' }}>
                        {meta.label}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--adm-text-2)', flex: 1 }}>
                        {log.resource}{log.resourceId ? <span className="adm-mono" style={{ fontSize: 10, color: 'var(--adm-text-4)', marginLeft: 4 }}>#{log.resourceId.slice(-6)}</span> : ''}
                        {log.detail && <span style={{ color: 'var(--adm-text-3)', marginLeft: 6 }}>— {log.detail}</span>}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--adm-text-4)', whiteSpace: 'nowrap' }}>{fmtRelative(log.createdAt)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Zone danger */}
          {user.role === 'PLAYER' && (
            <div className="adm-danger-zone">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-red)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={12} /> Zone de danger
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={toggleBan} disabled={saving} className={`adm-btn adm-btn-sm ${user.banned ? '' : 'adm-btn-danger'}`} style={user.banned ? { background: 'var(--adm-accent)', color: '#fff' } : undefined}>
                  {user.banned ? <><CheckCircle size={12} /> Débannir ce compte</> : <><Ban size={12} /> Bannir ce compte</>}
                </button>
                <button onClick={() => setShowDel(true)} className="adm-btn adm-btn-danger adm-btn-sm">
                  <Trash2 size={12} /> Supprimer définitivement
                </button>
              </div>
              <p style={{ fontSize: 11, color: 'var(--adm-text-4)', marginTop: 8 }}>
                La suppression efface toutes les données liées au compte (messages, articles, etc.)
              </p>
            </div>
          )}
        </div>
      </div>

      {showDel && (
        <DeleteModal
          user={user}
          onClose={() => setShowDel(false)}
          onDeleted={() => router.push('/admin/membres')}
        />
      )}
    </div>
  )
}
