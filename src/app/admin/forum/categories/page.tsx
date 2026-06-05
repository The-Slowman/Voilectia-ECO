'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, GripVertical, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  order: number
  _count: { posts: number }
}

const EMPTY = { name: '', slug: '', description: '', icon: '💬', color: '#3A7A52', order: 0 }

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export default function AdminForumCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const [form,       setForm]       = useState(EMPTY)
  const [editing,    setEditing]    = useState<string | null>(null)
  const [saving,     setSaving]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetch('/api/forum/categories').then(r => r.json()).catch(() => [])
    setCategories(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function startEdit(cat: Category) {
    setEditing(cat.id)
    setForm({
      name:        cat.name,
      slug:        cat.slug,
      description: cat.description ?? '',
      icon:        cat.icon ?? '💬',
      color:       cat.color ?? '#3A7A52',
      order:       cat.order,
    })
  }

  function cancelEdit() {
    setEditing(null)
    setForm(EMPTY)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Nom requis'); return }
    setSaving(true)
    try {
      const payload = { ...form, slug: form.slug || slugify(form.name) }

      if (editing) {
        await fetch(`/api/forum/categories/${editing}`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        })
        toast.success('Catégorie mise à jour')
      } else {
        await fetch('/api/forum/categories', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        })
        toast.success('Catégorie créée')
      }

      cancelEdit()
      load()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer la catégorie "${name}" ? Tous ses posts seront perdus.`)) return
    await fetch(`/api/forum/categories/${id}`, { method: 'DELETE' })
    toast.success('Catégorie supprimée')
    load()
  }

  const f = (key: string, value: string | number) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A3D2B]">Catégories du forum</h1>
          <p className="text-[#6B8C6A] text-sm">{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing('new')}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={15} /> Nouvelle catégorie
          </button>
        )}
      </div>

      {/* Formulaire création / édition */}
      {(editing !== null) && (
        <div className="bg-white border border-[#DBCAA8] rounded-xl p-6 shadow-sm">
          <h2 className="font-display font-bold text-[#1A3D2B] text-base mb-5">
            {editing === 'new' ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Nom *</label>
              <input
                className="input w-full"
                value={form.name}
                onChange={e => {
                  f('name', e.target.value)
                  if (!editing || editing === 'new') f('slug', slugify(e.target.value))
                }}
                placeholder="Tutoriels & Guides"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Slug</label>
              <input
                className="input w-full font-mono text-sm"
                value={form.slug}
                onChange={e => f('slug', e.target.value)}
                placeholder="tutoriels-guides"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Description</label>
              <input
                className="input w-full"
                value={form.description}
                onChange={e => f('description', e.target.value)}
                placeholder="Description courte visible sur la page forum"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Icône (emoji)</label>
              <input
                className="input w-full text-xl"
                value={form.icon}
                onChange={e => f('icon', e.target.value)}
                placeholder="💬"
                maxLength={4}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Couleur d'accent</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={e => f('color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-[#DBCAA8] cursor-pointer"
                />
                <input
                  className="input flex-1 font-mono text-sm"
                  value={form.color}
                  onChange={e => f('color', e.target.value)}
                  placeholder="#3A7A52"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Ordre d'affichage</label>
              <input
                type="number"
                className="input w-full"
                value={form.order}
                onChange={e => f('order', parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>

          {/* Aperçu */}
          <div className="mt-5 p-4 bg-[#F2E8D5] rounded-xl border border-[#DBCAA8]">
            <p className="text-[10px] text-[#9AB09A] uppercase tracking-wide mb-2">Aperçu</p>
            <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border"
                 style={{ borderLeft: `4px solid ${form.color}` }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                   style={{ background: `${form.color}18` }}>
                {form.icon || '💬'}
              </div>
              <div>
                <div className="font-semibold text-sm text-[#1A3D2B]">{form.name || 'Nom de la catégorie'}</div>
                <div className="text-xs text-[#9AB09A]">{form.description || 'Description…'}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Check size={14} />
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button onClick={cancelEdit} className="btn-secondary flex items-center gap-2 text-sm">
              <X size={14} /> Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des catégories */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-[#F2E8D5] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-[#DBCAA8] rounded-xl p-10 text-center">
          <p className="text-[#9AB09A]">Aucune catégorie. Créez-en une pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id}
                 className="bg-white border border-[#DBCAA8] rounded-xl px-5 py-3.5 flex items-center gap-4"
                 style={{ borderLeft: `4px solid ${cat.color ?? '#3A7A52'}` }}>
              <GripVertical size={16} className="text-[#DBCAA8] flex-shrink-0" />
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                   style={{ background: `${cat.color ?? '#3A7A52'}15` }}>
                {cat.icon ?? '💬'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#1A3D2B]">{cat.name}</div>
                <div className="text-xs text-[#9AB09A] truncate">
                  /{cat.slug} · {cat._count.posts} post{cat._count.posts !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(cat)}
                  className="p-2 hover:bg-[#F2E8D5] rounded-lg transition-colors text-[#6B8C6A] hover:text-[#1A3D2B]"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-[#9AB09A] hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
