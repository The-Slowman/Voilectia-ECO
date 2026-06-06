'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThumbsUp, ThumbsDown, Check, X, Zap, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminBadge } from '@/components/admin/AdminBadge'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

interface Suggestion {
  id: string; title: string; content: string; authorName: string
  status: string; upvotes: number; downvotes: number
  adminNote: string | null; createdAt: string
}

const STATUSES: { key: string; label: string; variant: 'orange' | 'blue' | 'cyan' | 'green' | 'red' | 'gray' }[] = [
  { key: 'pending',     label: 'En attente',  variant: 'orange' },
  { key: 'planned',     label: 'Planifié',    variant: 'blue'   },
  { key: 'in_progress', label: 'En cours',    variant: 'cyan'   },
  { key: 'done',        label: 'Réalisé',     variant: 'green'  },
  { key: 'rejected',    label: 'Refusé',      variant: 'red'    },
]

const STATUS_BORDER: Record<string, string> = {
  done:        'var(--adm-accent)',
  in_progress: 'var(--adm-cyan)',
  planned:     'var(--adm-blue)',
  rejected:    'var(--adm-red)',
  pending:     'var(--adm-border)',
}

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading,     setLoading]     = useState(true)
  const [editing,     setEditing]     = useState<string | null>(null)
  const [noteInput,   setNoteInput]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetch('/api/suggestions?sort=recent').then(r => r.json()).catch(() => [])
    setSuggestions(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/suggestions/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    toast.success('Statut mis à jour')
    load()
  }

  async function saveNote(id: string) {
    await fetch(`/api/suggestions/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNote: noteInput }),
    })
    toast.success('Note enregistrée')
    setEditing(null)
    load()
  }

  async function deleteSuggestion(id: string) {
    if (!confirm('Supprimer cette suggestion ?')) return
    await fetch(`/api/suggestions/${id}`, { method: 'DELETE' })
    toast.success('Suggestion supprimée')
    load()
  }

  const pending = suggestions.filter(s => s.status === 'pending').length

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Suggestions</h1>
          <p className="adm-page-subtitle">
            {pending > 0 && <AdminBadge variant="orange">{pending} en attente</AdminBadge>}
            {' '}{suggestions.length} au total
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => <div key={i} className="adm-skeleton" style={{ height: 100, borderRadius: 8 }} />)}
        </div>
      ) : suggestions.length === 0 ? (
        <AdminEmptyState icon="💡" title="Aucune suggestion" desc="Les joueurs peuvent soumettre des idées depuis leur espace." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {suggestions.map(s => {
            const score      = s.upvotes - s.downvotes
            const statusMeta = STATUSES.find(st => st.key === s.status) ?? STATUSES[0]

            return (
              <div key={s.id} className="adm-card" style={{
                padding: 16,
                borderLeft: `3px solid ${STATUS_BORDER[s.status] ?? 'var(--adm-border)'}`,
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
                  {/* Score */}
                  <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 40 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 18,
                      color: score > 0 ? 'var(--adm-accent)' : score < 0 ? 'var(--adm-red)' : 'var(--adm-text-3)',
                    }}>
                      {score > 0 ? '+' : ''}{score}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--adm-text-3)', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                      <ThumbsUp size={8} /> {s.upvotes} · <ThumbsDown size={8} /> {s.downvotes}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, color: 'var(--adm-text-1)', fontSize: 13 }}>{s.title}</span>
                      <AdminBadge variant={statusMeta.variant}>{statusMeta.label}</AdminBadge>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--adm-text-2)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {s.content}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--adm-text-3)', marginTop: 4 }}>
                      par {s.authorName} · {new Date(s.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <button onClick={() => deleteSuggestion(s.id)} className="adm-btn adm-btn-danger adm-btn-sm" style={{ flexShrink: 0 }}>
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Admin note */}
                {editing === s.id ? (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <input value={noteInput} onChange={e => setNoteInput(e.target.value)}
                           placeholder="Note publique visible par les joueurs…"
                           className="adm-input" style={{ fontSize: 12 }} autoFocus />
                    <button onClick={() => saveNote(s.id)} className="adm-btn adm-btn-primary adm-btn-sm"><Check size={12} /></button>
                    <button onClick={() => setEditing(null)} className="adm-btn adm-btn-ghost adm-btn-sm"><X size={12} /></button>
                  </div>
                ) : (
                  <button onClick={() => { setEditing(s.id); setNoteInput(s.adminNote ?? '') }}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--adm-text-3)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 10, padding: 0 }}>
                    <Zap size={10} />
                    {s.adminNote ? `Note : "${s.adminNote}"` : 'Ajouter une note publique'}
                  </button>
                )}

                {/* Status buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {STATUSES.map(st => (
                    <button key={st.key} onClick={() => updateStatus(s.id, st.key)}
                            className={`adm-badge adm-badge-${st.variant}`}
                            style={{
                              border: `1px solid ${s.status === st.key ? 'currentColor' : 'transparent'}`,
                              cursor: 'pointer', opacity: s.status === st.key ? 1 : 0.5,
                              fontWeight: s.status === st.key ? 700 : 500,
                              transition: 'opacity 0.12s',
                            }}>
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
