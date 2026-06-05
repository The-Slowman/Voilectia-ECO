'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface Event {
  id: string; title: string; slug: string; description: string
  startDate: string; endDate: string | null; location: string | null
  type: string; status: string; published: boolean; createdAt: string
  author: { name: string }
}

const TYPES   = ['community', 'build', 'economy', 'special']
const STATUSES = ['upcoming', 'ongoing', 'past']
const INIT = { title: '', slug: '', description: '', content: '', startDate: '', endDate: '', location: '', type: 'community', status: 'upcoming', published: false }

export default function AdminEvenementsPage() {
  const [events,   setEvents]   = useState<Event[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<string | null>(null)
  const [form,     setForm]     = useState(INIT)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/events?admin=1').then(r => r.json()).catch(() => [])
    setEvents(r)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const f = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))
  const genSlug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url    = editing ? `/api/events/${editing}` : '/api/events'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { toast.success(editing ? 'Mis à jour' : 'Créé'); setShowForm(false); setEditing(null); setForm(INIT); load() }
    else toast.error('Erreur')
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ?')) return
    await fetch(`/api/events/${id}`, { method: 'DELETE' })
    toast.success('Supprimé'); load()
  }

  function startEdit(ev: Event) {
    setForm({
      title: ev.title, slug: ev.slug, description: ev.description, content: '',
      startDate: ev.startDate.slice(0, 16), endDate: ev.endDate?.slice(0, 16) ?? '',
      location: ev.location ?? '', type: ev.type, status: ev.status, published: ev.published,
    })
    setEditing(ev.id); setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-[#E8F5EE] flex items-center gap-2">
          <Calendar size={22} /> Événements
        </h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(INIT) }}
                className="flex items-center gap-2 bg-[#3A7A52] hover:bg-[#2D6A4F] text-white px-4 py-2 rounded-xl text-sm font-semibold">
          <Plus size={16} /> Nouvel événement
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#111F18] border border-[rgba(82,183,136,0.15)] rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-[#E8F5EE]">{editing ? 'Modifier' : 'Nouvel événement'}</h2>
          <div>
            <label className="text-xs text-[#9DC4AD] mb-1 block">Titre</label>
            <input className="input w-full" value={form.title}
              onChange={e => { f('title', e.target.value); if (!editing) f('slug', genSlug(e.target.value)) }} required />
          </div>
          <div>
            <label className="text-xs text-[#9DC4AD] mb-1 block">Description courte</label>
            <textarea className="input w-full" rows={2} value={form.description} onChange={e => f('description', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Date de début</label>
              <input type="datetime-local" className="input w-full" value={form.startDate} onChange={e => f('startDate', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Date de fin</label>
              <input type="datetime-local" className="input w-full" value={form.endDate} onChange={e => f('endDate', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Lieu</label>
              <input className="input w-full" value={form.location} onChange={e => f('location', e.target.value)} placeholder="In-game" />
            </div>
            <div>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Type</label>
              <select className="input w-full" value={form.type} onChange={e => f('type', e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Statut</label>
              <select className="input w-full" value={form.status} onChange={e => f('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
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
                    className="text-[#9DC4AD] hover:text-[#E8F5EE] px-4 py-2 text-sm">Annuler</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-[#9DC4AD] text-center py-8">Chargement…</div>
      ) : events.length === 0 ? (
        <div className="text-center text-[#9DC4AD] py-12">Aucun événement.</div>
      ) : (
        <div className="space-y-2">
          {events.map(ev => (
            <div key={ev.id} className="bg-[#111F18] border border-[rgba(82,183,136,0.1)] rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[#52B788] bg-[rgba(82,183,136,0.1)] px-2 py-0.5 rounded">{ev.type}</span>
                  <span className="text-xs text-[#5A8A6A]">{ev.status}</span>
                  {ev.published
                    ? <span className="text-[10px] bg-[rgba(58,122,82,0.2)] text-[#52B788] px-2 py-0.5 rounded-full">Publié</span>
                    : <span className="text-[10px] bg-[rgba(255,255,255,0.05)] text-[#5A8A6A] px-2 py-0.5 rounded-full">Brouillon</span>}
                </div>
                <p className="text-sm font-semibold text-[#E8F5EE] truncate">{ev.title}</p>
                <p className="text-xs text-[#5A8A6A]">{formatDate(ev.startDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(ev)} className="p-2 text-[#5A8A6A] hover:text-[#52B788]"><Edit size={16} /></button>
                <button onClick={() => handleDelete(ev.id)} className="p-2 text-[#5A8A6A] hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
