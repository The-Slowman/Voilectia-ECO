'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ActiveBadge } from '@/components/admin/AdminBadge'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

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
    if (!confirm('Supprimer ce membre du staff ?')) return
    await fetch(`/api/staff/${id}`, { method: 'DELETE' })
    toast.success('Supprimé'); load()
  }

  function startEdit(m: StaffMember) {
    setForm({ name: m.name, role: m.role, description: m.description ?? '', avatar: m.avatar ?? '', discordId: m.discordId ?? '', order: m.order, active: m.active })
    setEditing(m.id); setShowForm(true)
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Staff</h1>
          <p className="adm-page-subtitle">{members.length} membre{members.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(INIT) }}
                className="adm-btn adm-btn-primary">
          <Plus size={13} /> Ajouter un membre
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="adm-card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 600, color: 'var(--adm-text-1)', marginBottom: 16 }}>
            {editing ? 'Modifier le membre' : 'Nouveau membre staff'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pseudo</label>
              <input className="adm-input" value={form.name} onChange={e => f('name', e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rôle</label>
              <input className="adm-input" value={form.role} onChange={e => f('role', e.target.value)} placeholder="Fondateur, Admin…" required />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
            <textarea className="adm-input" rows={2} value={form.description} onChange={e => f('description', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avatar (URL)</label>
              <input className="adm-input" value={form.avatar} onChange={e => f('avatar', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Discord ID</label>
              <input className="adm-input" style={{ fontFamily: 'monospace' }} value={form.discordId} onChange={e => f('discordId', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--adm-text-2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.active} onChange={e => f('active', e.target.checked)}
                     style={{ accentColor: 'var(--adm-accent)' }} />
              Actif
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ordre</label>
              <input type="number" className="adm-input" style={{ width: 70 }}
                     value={form.order} onChange={e => f('order', parseInt(e.target.value))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="adm-btn adm-btn-primary">
              {editing ? 'Mettre à jour' : 'Créer'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }}
                    className="adm-btn adm-btn-ghost">Annuler</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="adm-skeleton" style={{ height: 70, borderRadius: 8 }} />)}
        </div>
      ) : members.length === 0 ? (
        <AdminEmptyState icon="👥" title="Aucun membre staff" desc="Ajoutez les membres de votre équipe." action={{ label: 'Ajouter un membre', onClick: () => setShowForm(true) }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {members.map(m => (
            <div key={m.id} className="adm-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: 'var(--adm-surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, color: 'var(--adm-accent)', flexShrink: 0,
              }}>
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--adm-text-1)' }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--adm-accent)', marginTop: 1 }}>{m.role}</div>
                {!m.active && <ActiveBadge active={false} />}
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button onClick={() => startEdit(m)} className="adm-btn adm-btn-ghost adm-btn-sm"><Edit size={12} /></button>
                <button onClick={() => handleDelete(m.id)} className="adm-btn adm-btn-danger adm-btn-sm"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
