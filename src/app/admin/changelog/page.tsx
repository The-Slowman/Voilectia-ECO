'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import dynamic from 'next/dynamic'

const RichEditor = dynamic(
  () => import('@/components/admin/RichEditor').then(m => m.RichEditor),
  { ssr: false, loading: () => <div className="input min-h-[200px] animate-pulse" /> }
)

interface Changelog {
  id: string; version: string; title: string; content: string
  season: string; type: string; published: boolean; publishedAt: string | null
  createdAt: string; author: { name: string }
}

const TYPES = ['update', 'hotfix', 'major', 'content']
const INIT = { version: '', title: '', content: '', season: 'S1', type: 'update', published: false }

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
    const url    = editing ? `/api/changelog/${editing}` : '/api/changelog'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { toast.success(editing ? 'Mis à jour' : 'Créé'); setShowForm(false); setEditing(null); setForm(INIT); load() }
    else toast.error('Erreur')
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ?')) return
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-[#E8F5EE] flex items-center gap-2">
          <RefreshCw size={22} /> Changelog
        </h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(INIT) }}
                className="flex items-center gap-2 bg-[#3A7A52] hover:bg-[#2D6A4F] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> Nouvelle entrée
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#111F18] border border-[rgba(82,183,136,0.15)] rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-[#E8F5EE]">{editing ? 'Modifier' : 'Nouvelle entrée'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Version</label>
              <input className="input w-full" value={form.version} onChange={e => f('version', e.target.value)} placeholder="1.2.3" required />
            </div>
            <div>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Saison</label>
              <input className="input w-full" value={form.season} onChange={e => f('season', e.target.value)} placeholder="S1" />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#9DC4AD] mb-1 block">Titre</label>
            <input className="input w-full" value={form.title} onChange={e => f('title', e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-[#9DC4AD] mb-1 block">Type</label>
            <select className="input w-full" value={form.type} onChange={e => f('type', e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#9DC4AD] mb-1 block">Contenu</label>
            <RichEditor value={form.content} onChange={v => f('content', v)} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="pub" checked={form.published} onChange={e => f('published', e.target.checked)} />
            <label htmlFor="pub" className="text-sm text-[#9DC4AD]">Publier</label>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-[#3A7A52] text-white px-6 py-2 rounded-xl text-sm font-semibold">
              {editing ? 'Mettre à jour' : 'Créer'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }}
                    className="text-[#9DC4AD] hover:text-[#E8F5EE] px-4 py-2 text-sm">
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-[#9DC4AD] text-center py-8">Chargement…</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-[#9DC4AD] py-12">Aucune entrée changelog.</div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="bg-[#111F18] border border-[rgba(82,183,136,0.1)] rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-[#52B788] bg-[rgba(82,183,136,0.1)] px-2 py-0.5 rounded">v{entry.version}</span>
                  <span className="text-xs text-[#5A8A6A]">{entry.type} · {entry.season}</span>
                  {entry.published
                    ? <span className="text-[10px] bg-[rgba(58,122,82,0.2)] text-[#52B788] px-2 py-0.5 rounded-full">Publié</span>
                    : <span className="text-[10px] bg-[rgba(255,255,255,0.05)] text-[#5A8A6A] px-2 py-0.5 rounded-full">Brouillon</span>}
                </div>
                <p className="text-sm font-semibold text-[#E8F5EE] truncate">{entry.title}</p>
                <p className="text-xs text-[#5A8A6A]">{formatDate(entry.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => togglePublish(entry)} className="p-2 text-[#5A8A6A] hover:text-[#52B788] transition-colors">
                  {entry.published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={() => startEdit(entry)} className="p-2 text-[#5A8A6A] hover:text-[#52B788] transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(entry.id)} className="p-2 text-[#5A8A6A] hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
