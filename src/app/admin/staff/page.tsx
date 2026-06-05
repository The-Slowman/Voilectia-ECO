'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface StaffMember {
  id: string; name: string; role: string; description: string | null
  avatar: string | null; discordId: string | null; order: number; active: boolean
}

const INIT = { name: '', role: '', description: '', avatar: '', discordId: '', order: 0, active: true }

export default function AdminStaffPage() {
  const [members,  setMembers]  = useState<StaffMember[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<string | null>(null)
  const [form,     setForm]     = useState(INIT)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/staff').then(r => r.json()).catch(() => [])
    setMembers(r)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const f = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = editing ? `/api/staff/${editing}` : '/api/staff'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { toast.success(editing ? 'Mis à jour' : 'Créé'); setShowForm(false); setEditing(null); setForm(INIT); load() }
    else toast.error('Erreur')
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ?')) return
    await fetch(`/api/staff/${id}`, { method: 'DELETE' })
    toast.success('Supprimé'); load()
  }

  function startEdit(m: StaffMember) {
    setForm({ name: m.name, role: m.role, description: m.description ?? '', avatar: m.avatar ?? '', discordId: m.discordId ?? '', order: m.order, active: m.active })
    setEditing(m.id); setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-[#E8F5EE] flex items-center gap-2">
          <Users size={22} /> Staff
        </h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(INIT) }}
                className="flex items-center gap-2 bg-[#3A7A52] hover:bg-[#2D6A4F] text-white px-4 py-2 rounded-xl text-sm font-semibold">
          <Plus size={16} /> Ajouter un membre
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#111F18] border border-[rgba(82,183,136,0.15)] rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-[#E8F5EE]">{editing ? 'Modifier' : 'Nouveau membre'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Pseudo</label>
              <input className="input w-full" value={form.name} onChange={e => f('name', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Rôle</label>
              <input className="input w-full" value={form.role} onChange={e => f('role', e.target.value)} placeholder="Fondateur, Admin…" required />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#9DC4AD] mb-1 block">Description</label>
            <textarea className="input w-full" rows={2} value={form.description} onChange={e => f('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Avatar (URL)</label>
              <input className="input w-full" value={form.avatar} onChange={e => f('avatar', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[#9DC4AD] mb-1 block">Discord ID</label>
              <input className="input w-full font-mono" value={form.discordId} onChange={e => f('discordId', e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={form.active} onChange={e => f('active', e.target.checked)} />
              <label htmlFor="active" className="text-sm text-[#9DC4AD]">Actif</label>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#9DC4AD]">Ordre</label>
              <input type="number" className="input w-20" value={form.order} onChange={e => f('order', parseInt(e.target.value))} />
            </div>
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
      ) : members.length === 0 ? (
        <div className="text-center text-[#9DC4AD] py-12">Aucun membre staff.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map(m => (
            <div key={m.id} className="bg-[#111F18] border border-[rgba(82,183,136,0.1)] rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(82,183,136,0.1)] flex items-center justify-center font-bold text-[#52B788] flex-shrink-0">
                {m.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#E8F5EE]">{m.name}</p>
                <p className="text-xs text-[#52B788]">{m.role}</p>
                {!m.active && <span className="text-[10px] text-[#5A8A6A]">Inactif</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(m)} className="p-2 text-[#5A8A6A] hover:text-[#52B788]"><Edit size={15} /></button>
                <button onClick={() => handleDelete(m.id)} className="p-2 text-[#5A8A6A] hover:text-red-400"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
