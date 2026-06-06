'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const RichEditor = dynamic(
  () => import('@/components/admin/RichEditor').then(m => m.RichEditor),
  { ssr: false, loading: () => <div className="input min-h-[200px] animate-pulse" /> }
)

interface Tutorial {
  id: string; title: string; slug: string; excerpt: string | null
  category: string; authorName: string | null; published: boolean
  featured: boolean; views: number; order: number; createdAt: string
}

const CATEGORIES = [
  { key: 'general',      label: 'Général',      icon: '📖' },
  { key: 'debutant',     label: 'Débutant',     icon: '🌱' },
  { key: 'economie',     label: 'Économie',     icon: '💰' },
  { key: 'construction', label: 'Construction', icon: '🏗️' },
  { key: 'astuce',       label: 'Astuces',      icon: '💡' },
]

const EMPTY = {
  title: '', slug: '', excerpt: '', category: 'general',
  authorName: '', published: false, featured: false, order: 0,
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export default function AdminTutorielsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [loading,   setLoading]   = useState(true)
  const [editing,   setEditing]   = useState<string | null>(null)
  const [form,      setForm]      = useState(EMPTY)
  const [content,   setContent]   = useState('')
  const [saving,    setSaving]    = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetch('/api/tutorials?admin=1').then(r => r.json()).catch(() => [])
    setTutorials(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function startEdit(t?: Tutorial) {
    if (t) {
      setEditing(t.id)
      setForm({ title: t.title, slug: t.slug, excerpt: t.excerpt ?? '', category: t.category,
                authorName: t.authorName ?? '', published: t.published, featured: t.featured, order: t.order })
      // Charger le contenu
      const data = await fetch(`/api/tutorials/${t.id}`).then(r => r.json()).catch(() => ({}))
      setContent(data.content ?? '')
    } else {
      setEditing('new')
      setForm(EMPTY)
      setContent('')
    }
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Titre requis'); return }
    setSaving(true)
    try {
      const payload = { ...form, content, slug: form.slug || slugify(form.title) }
      if (editing === 'new') {
        await fetch('/api/tutorials', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify(payload),
        })
        toast.success('Tutoriel créé')
      } else {
        await fetch(`/api/tutorials/${editing}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify(payload),
        })
        toast.success('Tutoriel mis à jour')
      }
      setEditing(null)
      load()
    } catch { toast.error('Erreur') } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce tutoriel ?')) return
    await fetch(`/api/tutorials/${id}`, { method: 'DELETE' })
    toast.success('Supprimé')
    load()
  }

  async function toggleField(id: string, field: 'published' | 'featured', current: boolean) {
    await fetch(`/api/tutorials/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ [field]: !current }),
    })
    load()
  }

  const f = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A3D2B]">Tutoriels & Astuces</h1>
          <p className="text-[#6B8C6A] text-sm">{tutorials.length} tutoriel{tutorials.length !== 1 ? 's' : ''}</p>
        </div>
        {!editing && (
          <button onClick={() => startEdit()} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> Nouveau tutoriel
          </button>
        )}
      </div>

      {/* Formulaire */}
      {editing && (
        <div className="bg-white border border-[#DBCAA8] rounded-xl p-6 space-y-5">
          <h2 className="font-display font-bold text-[#1A3D2B] text-base">
            {editing === 'new' ? 'Nouveau tutoriel' : 'Modifier le tutoriel'}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Titre *</label>
              <input className="input w-full" value={form.title}
                     onChange={e => { f('title', e.target.value); if (editing === 'new') f('slug', slugify(e.target.value)) }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Slug</label>
              <input className="input w-full font-mono text-sm" value={form.slug}
                     onChange={e => f('slug', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Catégorie</label>
              <select className="input w-full" value={form.category} onChange={e => f('category', e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Auteur</label>
              <input className="input w-full" value={form.authorName}
                     onChange={e => f('authorName', e.target.value)} placeholder="Pseudo Eco" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Ordre</label>
              <input type="number" className="input w-full" value={form.order}
                     onChange={e => f('order', parseInt(e.target.value) || 0)} min={0} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Extrait / résumé</label>
              <textarea className="input w-full resize-none" rows={2} value={form.excerpt}
                        onChange={e => f('excerpt', e.target.value)}
                        placeholder="Courte description affichée dans les listes" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Contenu *</label>
            <RichEditor value={content} onChange={setContent} />
          </div>

          <div className="flex items-center gap-5 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" className="w-4 h-4 accent-[#1A3D2B]" checked={form.published}
                     onChange={e => f('published', e.target.checked)} />
              <span className="text-[#1A3D2B]">Publié</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" className="w-4 h-4 accent-[#D4A820]" checked={form.featured}
                     onChange={e => f('featured', e.target.checked)} />
              <span className="text-[#1A3D2B]">À la une ⭐</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
              <Check size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button onClick={() => setEditing(null)} className="btn-secondary flex items-center gap-2 text-sm">
              <X size={14} /> Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-[#F2E8D5] rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden">
          {tutorials.length === 0 ? (
            <p className="text-center py-10 text-[#9AB09A]">Aucun tutoriel créé.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DBCAA8] bg-[#F2E8D5]">
                  <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase">Titre</th>
                  <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase hidden md:table-cell">Catégorie</th>
                  <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase hidden lg:table-cell">Vues</th>
                  <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase">Statut</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {tutorials.map(t => {
                  const cat = CATEGORIES.find(c => c.key === t.category)
                  return (
                    <tr key={t.id} className="border-b border-[#DBCAA8] hover:bg-[#F2E8D5]/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-[#1A3D2B] text-sm">
                          {t.featured && <span className="mr-1.5">⭐</span>}
                          {t.title}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#6B8C6A] hidden md:table-cell">
                        {cat?.icon} {cat?.label}
                      </td>
                      <td className="px-5 py-3.5 text-[#9AB09A] hidden lg:table-cell">{t.views}</td>
                      <td className="px-5 py-3.5">
                        {t.published
                          ? <span className="text-[#3A7A52] text-xs font-semibold flex items-center gap-1"><Eye size={11} /> Publié</span>
                          : <span className="text-[#9AB09A] text-xs font-semibold flex items-center gap-1"><EyeOff size={11} /> Brouillon</span>
                        }
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => toggleField(t.id, 'featured', t.featured)}
                                  title={t.featured ? 'Retirer de la une' : 'Mettre à la une'}
                                  className={`p-1.5 rounded-lg ${t.featured ? 'text-[#D4A820] bg-[#FBF0C8]' : 'text-[#9AB09A] hover:bg-[#F2E8D5]'}`}>
                            <Star size={13} />
                          </button>
                          <button onClick={() => toggleField(t.id, 'published', t.published)}
                                  className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A]">
                            {t.published ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button onClick={() => startEdit(t)}
                                  className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A] hover:text-[#1A3D2B]">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(t.id)}
                                  className="p-1.5 hover:bg-red-50 rounded-lg text-[#9AB09A] hover:text-red-500">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
