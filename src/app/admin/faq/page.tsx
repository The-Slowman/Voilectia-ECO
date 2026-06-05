'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface FaqCategory { id: string; name: string; icon: string | null; order: number }
interface FaqItem { id: string; question: string; answer: string; categoryId: string; order: number; published: boolean }

export default function AdminFaqPage() {
  const [categories, setCategories] = useState<FaqCategory[]>([])
  const [items,      setItems]      = useState<FaqItem[]>([])
  const [loading,    setLoading]    = useState(true)
  const [tab,        setTab]        = useState<'items' | 'categories'>('items')
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState<string | null>(null)
  const [formType,   setFormType]   = useState<'item' | 'category'>('item')
  const [form,       setForm]       = useState<Record<string, unknown>>({})
  const [expanded,   setExpanded]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/faq').then(r => r.json()).catch(() => ({ categories: [], items: [] }))
    setCategories(r.categories ?? [])
    setItems(r.items ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const f = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  function openItemForm(item?: FaqItem) {
    setFormType('item')
    setForm(item ? { question: item.question, answer: item.answer, categoryId: item.categoryId, order: item.order, published: item.published }
                  : { question: '', answer: '', categoryId: categories[0]?.id ?? '', order: 0, published: true })
    setEditing(item?.id ?? null); setShowForm(true)
  }

  function openCatForm(cat?: FaqCategory) {
    setFormType('category')
    setForm(cat ? { name: cat.name, icon: cat.icon ?? '', order: cat.order } : { name: '', icon: '', order: 0 })
    setEditing(cat?.id ?? null); setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const isEdit = !!editing
    const url = isEdit ? `/api/faq/${editing}` : '/api/faq'
    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: formType, ...form }),
    })
    if (res.ok) { toast.success(isEdit ? 'Mis à jour' : 'Créé'); setShowForm(false); setEditing(null); load() }
    else toast.error('Erreur')
  }

  async function handleDelete(id: string, type: 'item' | 'category') {
    if (!confirm('Supprimer ?')) return
    await fetch(`/api/faq/${id}?type=${type === 'category' ? 'category' : 'item'}`, { method: 'DELETE' })
    toast.success('Supprimé'); load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-[#E8F5EE] flex items-center gap-2">
          <HelpCircle size={22} /> FAQ
        </h1>
        <div className="flex gap-2">
          <button onClick={() => openCatForm()}
                  className="flex items-center gap-2 bg-[#1A3D2B] border border-[rgba(82,183,136,0.3)] text-[#9DC4AD] px-3 py-2 rounded-xl text-sm">
            <Plus size={14} /> Catégorie
          </button>
          <button onClick={() => openItemForm()}
                  className="flex items-center gap-2 bg-[#3A7A52] hover:bg-[#2D6A4F] text-white px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus size={16} /> Question
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#111F18] border border-[rgba(82,183,136,0.15)] rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-[#E8F5EE]">{editing ? 'Modifier' : formType === 'category' ? 'Nouvelle catégorie' : 'Nouvelle question'}</h2>
          {formType === 'category' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#9DC4AD] mb-1 block">Nom</label>
                <input className="input w-full" value={String(form.name ?? '')} onChange={e => f('name', e.target.value)} required />
              </div>
              <div>
                <label className="text-xs text-[#9DC4AD] mb-1 block">Icône (emoji)</label>
                <input className="input w-full" value={String(form.icon ?? '')} onChange={e => f('icon', e.target.value)} />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs text-[#9DC4AD] mb-1 block">Catégorie</label>
                <select className="input w-full" value={String(form.categoryId ?? '')} onChange={e => f('categoryId', e.target.value)}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#9DC4AD] mb-1 block">Question</label>
                <input className="input w-full" value={String(form.question ?? '')} onChange={e => f('question', e.target.value)} required />
              </div>
              <div>
                <label className="text-xs text-[#9DC4AD] mb-1 block">Réponse</label>
                <textarea className="input w-full" rows={4} value={String(form.answer ?? '')} onChange={e => f('answer', e.target.value)} required />
              </div>
            </>
          )}
          <div className="flex gap-3">
            <button type="submit" className="bg-[#3A7A52] text-white px-6 py-2 rounded-xl text-sm font-semibold">
              {editing ? 'Mettre à jour' : 'Créer'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }}
                    className="text-[#9DC4AD] hover:text-[#E8F5EE] px-4 py-2 text-sm">Annuler</button>
          </div>
        </form>
      )}

      {loading ? <div className="text-[#9DC4AD] text-center py-8">Chargement…</div> : (
        <div className="space-y-4">
          {categories.map(cat => {
            const catItems = items.filter(i => i.categoryId === cat.id)
            return (
              <div key={cat.id} className="bg-[#111F18] border border-[rgba(82,183,136,0.1)] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 cursor-pointer"
                     onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}>
                  <span className="font-semibold text-[#E8F5EE] flex items-center gap-2">
                    {cat.icon} {cat.name}
                    <span className="text-xs text-[#5A8A6A] font-normal">({catItems.length})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); openCatForm(cat) }} className="p-1.5 text-[#5A8A6A] hover:text-[#52B788]"><Edit size={14} /></button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(cat.id, 'category') }} className="p-1.5 text-[#5A8A6A] hover:text-red-400"><Trash2 size={14} /></button>
                    {expanded === cat.id ? <ChevronDown size={16} className="text-[#5A8A6A]" /> : <ChevronRight size={16} className="text-[#5A8A6A]" />}
                  </div>
                </div>
                {expanded === cat.id && (
                  <div className="border-t border-[rgba(82,183,136,0.08)] divide-y divide-[rgba(82,183,136,0.06)]">
                    {catItems.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-[#5A8A6A] italic">Aucune question</p>
                    ) : catItems.map(item => (
                      <div key={item.id} className="px-4 py-3 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-[#9DC4AD]">{item.question}</p>
                          <p className="text-xs text-[#5A8A6A] mt-0.5 line-clamp-1">{item.answer}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openItemForm(item)} className="p-1.5 text-[#5A8A6A] hover:text-[#52B788]"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(item.id, 'item')} className="p-1.5 text-[#5A8A6A] hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {categories.length === 0 && <div className="text-center text-[#9DC4AD] py-12">Créez d&apos;abord une catégorie.</div>}
        </div>
      )}
    </div>
  )
}
