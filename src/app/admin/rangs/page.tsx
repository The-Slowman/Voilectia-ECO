'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Check, X, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

interface Rank {
  id: string; name: string; color: string; badge: string | null; level: number
  canPublish: boolean; canManageArticles: boolean
  canManageStaff: boolean; canManageRanks: boolean; canManageUsers: boolean
  isStaff: boolean; order: number
  _count: { users: number }
}

const PERM_LABELS: { key: keyof Rank; label: string }[] = [
  { key: 'canPublish',        label: 'Publier contenu'      },
  { key: 'canManageArticles', label: 'Articles & Guides'    },
  { key: 'canManageStaff',    label: 'Gestion staff'        },
  { key: 'canManageRanks',    label: 'Gestion rangs'        },
  { key: 'canManageUsers',    label: 'Gestion admins'       },
]

const STAFF_INIT = {
  name: '', color: '#3FB950', badge: '', level: 1, isStaff: true,
  canPublish: false, canManageArticles: false,
  canManageStaff: false, canManageRanks: false, canManageUsers: false,
}

export default function AdminRangsPage() {
  const [ranks,    setRanks]    = useState<Rank[]>([])
  const [editingS, setEditingS] = useState<string | null>(null)
  const [formS,    setFormS]    = useState(STAFF_INIT)
  const [saving,   setSaving]   = useState(false)

  const load = useCallback(async () => {
    const data = await fetch('/api/ranks').then(r => r.json()).catch(() => ({ ranks: [] }))
    setRanks(data.ranks ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  function startEditStaff(r?: Rank) {
    setEditingS(r?.id ?? 'new')
    if (r) {
      setFormS({
        name: r.name, color: r.color, badge: r.badge ?? '', level: r.level, isStaff: r.isStaff,
        canPublish: r.canPublish, canManageArticles: r.canManageArticles,
        canManageStaff: r.canManageStaff, canManageRanks: r.canManageRanks, canManageUsers: r.canManageUsers,
      })
    } else setFormS(STAFF_INIT)
  }

  async function saveStaffRank() {
    if (!formS.name.trim()) { toast.error('Nom requis'); return }
    setSaving(true)
    try {
      const url    = editingS === 'new' ? '/api/ranks' : `/api/ranks/${editingS}`
      const method = editingS === 'new' ? 'POST' : 'PATCH'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formS) })
      toast.success(editingS === 'new' ? 'Rang créé' : 'Rang mis à jour')
      setEditingS(null); setFormS(STAFF_INIT); load()
    } catch { toast.error('Erreur') } finally { setSaving(false) }
  }

  async function deleteRank(id: string) {
    if (!confirm('Supprimer ce rang ?')) return
    await fetch(`/api/ranks/${id}`, { method: 'DELETE' })
    toast.success('Rang supprimé'); load()
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Rangs staff</h1>
          <p className="adm-page-subtitle">
            {ranks.length} rang{ranks.length !== 1 ? 's' : ''} staff · permissions d'administration
          </p>
        </div>
        <button onClick={() => startEditStaff()} className="adm-btn adm-btn-primary">
          <Plus size={13} /> Nouveau rang
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {editingS && (
          <div className="adm-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 600, color: 'var(--adm-text-1)', marginBottom: 16 }}>
              {editingS === 'new' ? 'Nouveau rang staff' : 'Modifier le rang'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nom *</label>
                <input className="adm-input" value={formS.name} onChange={e => setFormS(p => ({ ...p, name: e.target.value }))} placeholder="Modérateur" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Badge emoji</label>
                <input className="adm-input" style={{ fontSize: 18 }} value={formS.badge} onChange={e => setFormS(p => ({ ...p, badge: e.target.value }))} placeholder="🛡️" maxLength={4} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Niveau</label>
                <input type="number" className="adm-input" value={formS.level} min={0} max={10}
                       onChange={e => setFormS(p => ({ ...p, level: parseInt(e.target.value) || 0 }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Couleur</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={formS.color} onChange={e => setFormS(p => ({ ...p, color: e.target.value }))}
                         style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--adm-border)', cursor: 'pointer', background: 'none', padding: 2 }} />
                  <input className="adm-input" style={{ fontFamily: 'monospace', flex: 1 }} value={formS.color}
                         onChange={e => setFormS(p => ({ ...p, color: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Permissions</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6 }}>
                {PERM_LABELS.map(({ key, label }) => (
                  <label key={key} className="adm-card"
                         style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" style={{ accentColor: 'var(--adm-accent)', width: 13, height: 13 }}
                           checked={!!(formS as Record<string, unknown>)[key]}
                           onChange={e => setFormS(p => ({ ...p, [key]: e.target.checked }))} />
                    <span style={{ fontSize: 12, color: 'var(--adm-text-1)' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveStaffRank} disabled={saving} className="adm-btn adm-btn-primary">
                <Check size={12} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button onClick={() => { setEditingS(null); setFormS(STAFF_INIT) }} className="adm-btn adm-btn-ghost">
                <X size={12} /> Annuler
              </button>
            </div>
          </div>
        )}

        {ranks.length === 0 && !editingS ? (
          <AdminEmptyState icon="🛡️" title="Aucun rang staff" action={{ label: 'Créer un rang', onClick: () => startEditStaff() }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ranks.map(r => {
              const permCount = PERM_LABELS.filter(({ key }) => !!(r as unknown as Record<string, unknown>)[key]).length
              return (
                <div key={r.id} className="adm-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderLeft: `3px solid ${r.color}` }}>
                  <div style={{ fontSize: 20, flexShrink: 0 }}>{r.badge ?? '👤'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--adm-text-1)' }}>{r.name}</span>
                      <span className="adm-badge" style={{ background: `${r.color}20`, color: r.color, fontSize: 10 }}>
                        Niveau {r.level}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--adm-text-3)', display: 'flex', gap: 10 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={9} /> {r._count.users} admin{r._count.users !== 1 ? 's' : ''}</span>
                      <span>{permCount} permission{permCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => startEditStaff(r)} className="adm-btn adm-btn-ghost adm-btn-sm"><Pencil size={12} /></button>
                    <button onClick={() => deleteRank(r.id)} className="adm-btn adm-btn-danger adm-btn-sm"><Trash2 size={12} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
