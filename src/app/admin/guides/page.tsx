'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, EyeOff, BookOpen, Tag, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import dynamic from 'next/dynamic'

const RichEditor = dynamic(
  () => import('@/components/admin/RichEditor').then(m => m.RichEditor),
  { ssr: false, loading: () => <div className="input min-h-[200px] animate-pulse" /> }
)

interface Guide {
  id: string; title: string; slug: string; excerpt: string | null
  content: string; category: string; published: boolean; order: number
  createdAt: string; author: { name: string }
}
interface Cat { id: string; slug: string; name: string; icon: string | null }

const INIT = { title: '', slug: '', excerpt: '', content: '', category: 'debutant', published: false, order: 0 }

export default function AdminGuidesPage() {
  const [guides,   setGuides]   = useState<Guide[]>([])
  const [cats,     setCats]     = useState<Cat[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<string | null>(null)
  const [form,     setForm]     = useState(INIT)
  const [showCats, setShowCats] = useState(false)
  const [newCat,   setNewCat]   = useState({ name: '', icon: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const [g, c] = await Promise.all([
      fetch('/api/guides?admin=1').then(r => r.json()).catch(() => []),
      fetch('/api/guide-categories').then(r => r.json()).catch(() => []),
    ])
    setGuides(Array.isArray(g) ? g : [])
    setCats(Array.isArray(c) ? c : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const f = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  function genSlug(title: string) {
    return title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url    = editing ? `/api/guides/${editing}` : '/api/guides'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { toast.success(editing ? 'Mis a jour' : 'Cree'); setShowForm(false); setEditing(null); setForm(INIT); load() }
    else toast.error('Erreur')
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ?')) return
    await fetch(`/api/guides/${id}`, { method: 'DELETE' })
    toast.success('Supprime'); load()
  }

  async function togglePublish(guide: Guide) {
    await fetch(`/api/guides/${guide.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !guide.published }),
    })
    load()
  }

  function startEdit(g: Guide) {
    setForm({ title: g.title, slug: g.slug, excerpt: g.excerpt ?? '', content: g.content, category: g.category, published: g.published, order: g.order })
    setEditing(g.id); setShowForm(true)
  }

  async function addCategory() {
    if (!newCat.name.trim()) { toast.error('Nom requis'); return }
    const res = await fetch('/api/guide-categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat.name, icon: newCat.icon || null, order: cats.length + 1 }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) { toast.success('Categorie ajoutee'); setNewCat({ name: '', icon: '' }); load() }
    else toast.error(data.error ?? 'Erreur')
  }
  async function deleteCategory(id: string, slug: string) {
    const used = guides.filter(g => g.category === slug).length
    if (!confirm(used > 0 ? `${used} guide(s) utilisent cette categorie. Les supprimer de la liste ne supprime pas les guides. Continuer ?` : 'Supprimer cette categorie ?')) return
    const res = await fetch(`/api/guide-categories/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Categorie supprimee'); load() } else toast.error('Erreur')
  }

  const catLabel = (slug: string) => {
    const c = cats.find(x => x.slug === slug)
    return c ? `${c.icon ?? ''} ${c.name}`.trim() : slug
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl text-[#E8F5EE] flex items-center gap-2">
          <BookOpen size={22} /> Guides
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setShowCats(v => !v)}
                  className="flex items-center gap-2 bg-[#1c3326] hover:bg-[#26492f] text-[#9DC4AD] px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-[rgba(82,183,136,0.2)]">
            <Tag size={15} /> Categories
          </button>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(INIT) }}
                  className="flex items-center gap-2 bg-[#3A7A52] hover:bg-[#2D6A4F] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            <Plus size={16} /> Nouveau guide
          </button>
        </div>
      </div>

      {/* Gestion des categories */}
      {showCats && (
        <div className="bg-[#111F18] border border-[rgba(82,183,136,0.15)] rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-[#E8F5EE] flex items-center gap-2"><Tag size={16} /> Categories de guides</h2>
          <div className="flex flex-wrap gap-2">
            {cats.map(c => (
              <span key={c.id} className="inline-flex items-center gap-2 bg-[rgba(82,183,136,0.1)] text-[#9DC4AD] px-3 py-1.5 rounded-full text-sm border border-[rgba(82,183,136,0.2)]">
                <span>{c.icon} {c.name}</span>
                <button onClick={() => deleteCategory(c.id, c.slug)} className="text-[#5A8A6A] hover:text-red-400" title="Supprimer"><X size={13} /></button>
              </span>
            ))}
            {cats.length === 0 && <span className="text-[#5A8A6A] text-sm">Aucune categorie.</span>}
          </div>
          <div className="flex items-end gap-2 flex-wrap pt-2 border-t border-[rgba(82,183,136,0.1)]">
            <div style={{ width: 70 }}>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Icone</label>
              <input className="input w-full text-center" value={newCat.icon} onChange={e => setNewCat(p => ({ ...p, icon: e.target.value }))} placeholder="🌱" maxLength={4} />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-[#9DC4AD] mb-1 block">Nouvelle categorie</label>
              <input className="input w-full" value={newCat.name} onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} placeholder="Constructions, PvP, Mods..." />
            </div>
            <button onClick={addCategory} className="flex items-center gap-2 bg-[#3A7A52] hover:bg-[#2D6A4F] text-white px-4 py-2 rounded-xl text-sm font-semibold"><Check size={14} /> Ajouter</button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#111F18] border border-[rgba(82,183,136,0.15)] rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-[#E8F5EE]">{editing ? 'Modifier' : 'Nouveau guide'}</h2>
          <div>
            <label className="text-xs text-[#9DC4AD] mb-1 block">Titre</label>
            <input className="input w-full" value={form.title}
              onChange={e => { f('title', e.target.value); if (!editing) f('slug', genSlug(e.target.value)) }} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Slug</label>
              <input className="input w-full font-mono text-sm" value={form.slug} onChange={e => f('slug', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Categorie</label>
              <select className="input w-full" value={form.category} onChange={e => f('category', e.target.value)}>
                {cats.map(c => <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>)}
                {cats.length === 0 && <option value="debutant">Debutant</option>}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-[#9DC4AD] mb-1 block">Resume</label>
            <textarea className="input w-full" rows={2} value={form.excerpt} onChange={e => f('excerpt', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-[#9DC4AD] mb-1 block">Contenu</label>
            <RichEditor value={form.content} onChange={v => f('content', v)} />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pub" checked={form.published} onChange={e => f('published', e.target.checked)} />
              <label htmlFor="pub" className="text-sm text-[#9DC4AD]">Publier</label>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#9DC4AD]">Ordre</label>
              <input type="number" className="input w-20" value={form.order} onChange={e => f('order', parseInt(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-[#3A7A52] text-white px-6 py-2 rounded-xl text-sm font-semibold">
              {editing ? 'Mettre a jour' : 'Creer'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }}
                    className="text-[#9DC4AD] hover:text-[#E8F5EE] px-4 py-2 text-sm">Annuler</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-[#9DC4AD] text-center py-8">Chargement...</div>
      ) : guides.length === 0 ? (
        <div className="text-center text-[#9DC4AD] py-12">Aucun guide.</div>
      ) : (
        <div className="space-y-2">
          {guides.map(g => (
            <div key={g.id} className="bg-[#111F18] border border-[rgba(82,183,136,0.1)] rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[#52B788] bg-[rgba(82,183,136,0.1)] px-2 py-0.5 rounded">{catLabel(g.category)}</span>
                  {g.published
                    ? <span className="text-[10px] bg-[rgba(58,122,82,0.2)] text-[#52B788] px-2 py-0.5 rounded-full">Publie</span>
                    : <span className="text-[10px] bg-[rgba(255,255,255,0.05)] text-[#5A8A6A] px-2 py-0.5 rounded-full">Brouillon</span>}
                </div>
                <p className="text-sm font-semibold text-[#E8F5EE] truncate">{g.title}</p>
                <p className="text-xs text-[#5A8A6A]">{formatDate(g.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => togglePublish(g)} className="p-2 text-[#5A8A6A] hover:text-[#52B788]"><EyeOff size={16} /></button>
                <button onClick={() => startEdit(g)} className="p-2 text-[#5A8A6A] hover:text-[#52B788]"><Edit size={16} /></button>
                <button onClick={() => handleDelete(g.id)} className="p-2 text-[#5A8A6A] hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
