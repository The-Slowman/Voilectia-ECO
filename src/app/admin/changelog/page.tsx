'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { PublishedBadge, AdminBadge } from '@/components/admin/AdminBadge'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

const RichEditor = dynamic(
  () => import('@/components/admin/RichEditor').then(m => m.RichEditor),
  { ssr: false, loading: () => <div className="adm-skeleton" style={{ minHeight: 200, borderRadius: 6 }} /> }
)

interface Changelog {
  id: string; version: string; title: string; content: string
  season: string; type: string; published: boolean; publishedAt: string | null
  createdAt: string; author: { name: string }
}

const TYPE_VARIANT: Record<string, 'blue' | 'red' | 'purple' | 'cyan'> = {
  update: 'blue', hotfix: 'red', major: 'purple', content: 'cyan',
}

const TYPES = ['update', 'hotfix', 'major', 'content']
const INIT  = { version: '', title: '', content: '', season: 'S1', type: 'update', published: false }

export default function AdminChangelogPage() {
  const [entries,  setEntries]  = useState<Changelog[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<string | null>(null)
  const [form,     setForm]     = useState(INIT)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/changelog?admin=1').then(r => r.json()).catch(() => [])
    setEntries(r)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const f = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = editing ? `/api/changelog/${editing}` : '/api/changelog'
    const res = await fetch(url, {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success(editing ? 'Mis à jour' : 'Créé')
      setShowForm(false); setEditing(null); setForm(INIT); load()
    } else toast.error('Erreur')
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette entrée ?')) return
    await fetch(`/api/changelog/${id}`, { method: 'DELETE' })
    toast.success('Supprimé'); load()
  }

  async function togglePublish(entry: Changelog) {
    await fetch(`/api/changelog/${entry.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !entry.published, publishedAt: !entry.published ? new Date().toISOString() : null }),
    })
    load()
  }

  function startEdit(entry: Changelog) {
    setForm({ version: entry.version, title: entry.title, content: entry.content, season: entry.season, type: entry.type, published: entry.published })
    setEditing(entry.id); setShowForm(true)
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Changelog</h1>
          <p className="adm-page-subtitle">{entries.length} entrée{entries.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(INIT) }}
                className="adm-btn adm-btn-primary">
          <Plus size={13} /> Nouvelle entrée
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="adm-card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 600, color: 'var(--adm-text-1)', marginBottom: 16 }}>
            {editing ? 'Modifier l\'entrée' : 'Nouvelle entrée changelog'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Version</label>
              <input className="adm-input" value={form.version} onChange={e => f('version', e.target.value)} placeholder="1.2.3" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Saison</label>
              <input className="adm-input" value={form.season} onChange={e => f('season', e.target.value)} placeholder="S1" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</label>
              <select className="adm-input" value={form.type} onChange={e => f('type', e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Titre</label>
            <input className="adm-input" value={form.title} onChange={e => f('title', e.target.value)} required />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contenu</label>
            <RichEditor value={form.content} onChange={v => f('content', v)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <input type="checkbox" id="pub" checked={form.published} onChange={e => f('published', e.target.checked)}
                   style={{ accentColor: 'var(--adm-accent)' }} />
            <label htmlFor="pub" style={{ fontSize: 13, color: 'var(--adm-text-2)', cursor: 'pointer' }}>Publier immédiatement</label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="adm-btn adm-btn-primary">{editing ? 'Mettre à jour' : 'Créer'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }}
                    className="adm-btn adm-btn-ghost">Annuler</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => <div key={i} className="adm-skeleton" style={{ height: 60, borderRadius: 8 }} />)}
        </div>
      ) : entries.length === 0 ? (
        <AdminEmptyState
          icon="📋"
          title="Aucune entrée changelog"
          desc="Documentez les mises à jour du serveur."
          action={{ label: 'Créer une entrée', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Titre</th>
                <th>Type</th>
                <th>Date</th>
                <th>Statut</th>
                <th style={{ width: 110 }} />
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--adm-accent-sub)', color: 'var(--adm-accent)', padding: '2px 7px', borderRadius: 4 }}>
                      v{entry.version}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--adm-text-3)', marginLeft: 6 }}>{entry.season}</span>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--adm-text-1)' }}>{entry.title}</td>
                  <td>
                    <AdminBadge variant={TYPE_VARIANT[entry.type] ?? 'gray'}>{entry.type}</AdminBadge>
                  </td>
                  <td style={{ color: 'var(--adm-text-3)', fontSize: 12 }}>{formatDate(entry.createdAt)}</td>
                  <td><PublishedBadge published={entry.published} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button onClick={() => togglePublish(entry)} className="adm-btn adm-btn-ghost adm-btn-sm"
                              title={entry.published ? 'Masquer' : 'Publier'}>
                        {entry.published ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => startEdit(entry)} className="adm-btn adm-btn-ghost adm-btn-sm">
                        <Edit size={12} />
                      </button>
                      <button onClick={() => handleDelete(entry.id)} className="adm-btn adm-btn-danger adm-btn-sm">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
