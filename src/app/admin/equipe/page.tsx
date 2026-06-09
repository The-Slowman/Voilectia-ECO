'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Check, X, ShieldCheck, KeyRound, Mail, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

interface AdminUser {
  id: string; name: string; email: string; role: string
  createdAt: string; lastLoginAt: string | null
}

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Fondateur (accès total)' },
  { value: 'ADMIN',       label: 'Administrateur' },
  { value: 'MODERATOR',   label: 'Modérateur' },
  { value: 'ANIMATOR',    label: 'Animateur' },
  { value: 'DEVELOPER',   label: 'Développeur' },
  { value: 'EDITOR',      label: 'Éditeur' },
]
const roleLabel = (r: string) => ROLE_OPTIONS.find(o => o.value === r)?.label ?? r

const INIT = { name: '', email: '', password: '', role: 'EDITOR' }

export default function AdminEquipePage() {
  const [me,      setMe]      = useState<{ role: string } | null>(null)
  const [meReady, setMeReady] = useState(false)
  const [users,   setUsers]   = useState<AdminUser[]>([])
  const [form,    setForm]    = useState(INIT)
  const [creating,setCreating]= useState(false)
  const [saving,  setSaving]  = useState(false)

  const load = useCallback(async () => {
    const data = await fetch('/api/admin/users').then(r => r.ok ? r.json() : { users: [] }).catch(() => ({ users: [] }))
    setUsers(data.users ?? [])
  }, [])

  useEffect(() => {
    fetch('/api/admin/auth/me').then(r => r.json()).then(d => { setMe(d); setMeReady(true) }).catch(() => setMeReady(true))
    load()
  }, [load])

  const isFounder = me?.role === 'SUPER_ADMIN'

  async function createUser() {
    if (!form.name.trim() || !form.email.trim() || !form.password) { toast.error('Tous les champs sont requis'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
      toast.success('Compte créé')
      setForm(INIT); setCreating(false); load()
    } catch { toast.error('Erreur réseau') } finally { setSaving(false) }
  }

  async function updateRole(id: string, role: string) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
    toast.success('Rôle mis à jour'); load()
  }

  async function resetPassword(id: string, email: string) {
    const pwd = prompt(`Nouveau mot de passe pour ${email} (8 caractères min.) :`)
    if (!pwd) return
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
    toast.success('Mot de passe mis à jour')
  }

  async function removeUser(id: string, email: string) {
    if (!confirm(`Supprimer le compte ${email} ?`)) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
    toast.success('Compte supprimé'); load()
  }

  if (meReady && !isFounder) {
    return (
      <div>
        <div className="adm-page-header">
          <div>
            <h1 className="adm-page-title">Équipe & accès</h1>
            <p className="adm-page-subtitle">Gestion des comptes d'administration</p>
          </div>
        </div>
        <AdminEmptyState icon="🔒" title="Réservé au fondateur" desc="Seul un compte Fondateur (SUPER_ADMIN) peut gérer les accès admin." />
      </div>
    )
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Équipe & accès</h1>
          <p className="adm-page-subtitle">
            {users.length} compte{users.length !== 1 ? 's' : ''} d'administration · réservé au fondateur
          </p>
        </div>
        <button onClick={() => setCreating(v => !v)} className="adm-btn adm-btn-primary">
          <Plus size={13} /> Nouveau compte
        </button>
      </div>

      {creating && (
        <div className="adm-card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: 'var(--adm-text-1)', marginBottom: 16 }}>Créer un compte d'administration</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pseudo *</label>
              <input className="adm-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Modo Marc" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email *</label>
              <input className="adm-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="modo@voilectia.fr" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mot de passe * (8 car. min.)</label>
              <input className="adm-input" type="text" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rôle</label>
              <select className="adm-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={createUser} disabled={saving} className="adm-btn adm-btn-primary">
              <Check size={12} /> {saving ? 'Création…' : 'Créer le compte'}
            </button>
            <button onClick={() => { setCreating(false); setForm(INIT) }} className="adm-btn adm-btn-ghost">
              <X size={12} /> Annuler
            </button>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <AdminEmptyState icon="👤" title="Aucun compte" action={{ label: 'Créer un compte', onClick: () => setCreating(true) }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {users.map(u => (
            <div key={u.id} className="adm-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--adm-accent-sub)', color: 'var(--adm-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                {u.role === 'SUPER_ADMIN' ? <ShieldCheck size={16} /> : u.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--adm-text-1)' }}>{u.name}</div>
                <div style={{ fontSize: 11, color: 'var(--adm-text-3)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Mail size={9} /> {u.email}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={9} /> {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('fr-FR') : 'jamais connecté'}</span>
                </div>
              </div>
              <select
                className="adm-input"
                style={{ width: 200, flexShrink: 0 }}
                value={u.role}
                onChange={e => updateRole(u.id, e.target.value)}
              >
                {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button onClick={() => resetPassword(u.id, u.email)} className="adm-btn adm-btn-ghost adm-btn-sm" title="Réinitialiser le mot de passe"><KeyRound size={12} /></button>
                <button onClick={() => removeUser(u.id, u.email)} className="adm-btn adm-btn-danger adm-btn-sm" title="Supprimer"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: 14, fontSize: 11, color: 'var(--adm-text-4)' }}>
        Astuce : <strong>{roleLabel('SUPER_ADMIN')}</strong> a accès à tout (dont cette page). Les autres rôles donnent accès au panel mais pas à la gestion des comptes.
      </p>
    </div>
  )
}
