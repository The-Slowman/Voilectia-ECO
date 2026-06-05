'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Check, X, Shield, Star, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface Rank {
  id: string; name: string; color: string; badge: string | null; level: number
  canPublish: boolean; canManageArticles: boolean; canManageForum: boolean
  canManageVilles: boolean; canManageStaff: boolean; canManageRecruitment: boolean
  canManageSurveys: boolean; canManageRanks: boolean; canManageUsers: boolean
  isStaff: boolean; order: number
  _count: { users: number }
}
interface PlayerRank {
  id: string; name: string; color: string; badge: string | null
  description: string | null; order: number
  _count: { users: number }
}

const PERM_LABELS: { key: keyof Rank; label: string }[] = [
  { key: 'canPublish',          label: 'Publier contenu' },
  { key: 'canManageArticles',   label: 'Articles & Guides' },
  { key: 'canManageForum',      label: 'Modération forum' },
  { key: 'canManageVilles',     label: 'Gestion villes' },
  { key: 'canManageRecruitment',label: 'Recrutement' },
  { key: 'canManageSurveys',    label: 'Sondages' },
  { key: 'canManageStaff',      label: 'Gestion staff' },
  { key: 'canManageRanks',      label: 'Gestion rangs' },
  { key: 'canManageUsers',      label: 'Gestion utilisateurs' },
]

const STAFF_INIT = {
  name: '', color: '#3A7A52', badge: '', level: 1, isStaff: true,
  canPublish: false, canManageArticles: false, canManageForum: false,
  canManageVilles: false, canManageStaff: false, canManageRecruitment: false,
  canManageSurveys: false, canManageRanks: false, canManageUsers: false,
}
const PLAYER_INIT = { name: '', color: '#D4A820', badge: '', description: '', order: 0 }

export default function AdminRangsPage() {
  const [ranks,       setRanks]       = useState<Rank[]>([])
  const [playerRanks, setPlayerRanks] = useState<PlayerRank[]>([])
  const [tab,         setTab]         = useState<'staff' | 'ingame'>('staff')
  const [editingS,    setEditingS]    = useState<string | null>(null)
  const [editingP,    setEditingP]    = useState<string | null>(null)
  const [formS,       setFormS]       = useState(STAFF_INIT)
  const [formP,       setFormP]       = useState(PLAYER_INIT)
  const [saving,      setSaving]      = useState(false)

  const load = useCallback(async () => {
    const data = await fetch('/api/ranks').then(r => r.json()).catch(() => ({ ranks: [], playerRanks: [] }))
    setRanks(data.ranks ?? [])
    setPlayerRanks(data.playerRanks ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  // ── Staff ranks ──────────────────────────────────────────
  function startEditStaff(r?: Rank) {
    setEditingS(r?.id ?? 'new')
    if (r) {
      setFormS({
        name: r.name, color: r.color, badge: r.badge ?? '', level: r.level,
        isStaff: r.isStaff,
        canPublish: r.canPublish, canManageArticles: r.canManageArticles,
        canManageForum: r.canManageForum, canManageVilles: r.canManageVilles,
        canManageStaff: r.canManageStaff, canManageRecruitment: r.canManageRecruitment,
        canManageSurveys: r.canManageSurveys, canManageRanks: r.canManageRanks,
        canManageUsers: r.canManageUsers,
      })
    } else {
      setFormS(STAFF_INIT)
    }
  }

  async function saveStaffRank() {
    if (!formS.name.trim()) { toast.error('Nom requis'); return }
    setSaving(true)
    try {
      if (editingS === 'new') {
        await fetch('/api/ranks', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify({ type: 'staff', ...formS }),
        })
        toast.success('Rang créé')
      } else {
        await fetch(`/api/ranks/${editingS}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify({ type: 'staff', ...formS }),
        })
        toast.success('Rang mis à jour')
      }
      setEditingS(null)
      setFormS(STAFF_INIT)
      load()
    } catch { toast.error('Erreur') } finally { setSaving(false) }
  }

  async function deleteRank(id: string, type: 'staff' | 'player') {
    if (!confirm('Supprimer ce rang ?')) return
    await fetch(`/api/ranks/${id}?type=${type === 'player' ? 'player' : 'staff'}`, { method: 'DELETE' })
    toast.success('Rang supprimé')
    load()
  }

  // ── Player ranks ─────────────────────────────────────────
  function startEditPlayer(r?: PlayerRank) {
    setEditingP(r?.id ?? 'new')
    if (r) {
      setFormP({ name: r.name, color: r.color, badge: r.badge ?? '', description: r.description ?? '', order: r.order })
    } else {
      setFormP(PLAYER_INIT)
    }
  }

  async function savePlayerRank() {
    if (!formP.name.trim()) { toast.error('Nom requis'); return }
    setSaving(true)
    try {
      if (editingP === 'new') {
        await fetch('/api/ranks', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify({ type: 'player', ...formP }),
        })
        toast.success('Rang créé')
      } else {
        await fetch(`/api/ranks/${editingP}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify({ type: 'player', ...formP }),
        })
        toast.success('Rang mis à jour')
      }
      setEditingP(null)
      setFormP(PLAYER_INIT)
      load()
    } catch { toast.error('Erreur') } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A3D2B]">Rangs</h1>
          <p className="text-[#6B8C6A] text-sm">
            {ranks.length} rang{ranks.length !== 1 ? 's' : ''} staff · {playerRanks.length} rang{playerRanks.length !== 1 ? 's' : ''} in-game
          </p>
        </div>
        <button
          onClick={() => tab === 'staff' ? startEditStaff() : startEditPlayer()}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={15} /> Nouveau rang
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-[#DBCAA8]">
        {[
          { key: 'staff',  label: `🛡️ Staff (${ranks.length})`,         icon: <Shield size={14} /> },
          { key: 'ingame', label: `⭐ In-game (${playerRanks.length})`,  icon: <Star size={14} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    tab === t.key ? 'border-[#1A3D2B] text-[#1A3D2B]' : 'border-transparent text-[#6B8C6A] hover:text-[#1A3D2B]'
                  }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Rangs Staff ── */}
      {tab === 'staff' && (
        <div className="space-y-4">
          {editingS && (
            <div className="bg-white border border-[#DBCAA8] rounded-xl p-6 space-y-5">
              <h2 className="font-display font-bold text-[#1A3D2B] text-base">
                {editingS === 'new' ? 'Nouveau rang staff' : 'Modifier le rang'}
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Nom *</label>
                  <input className="input w-full" value={formS.name}
                         onChange={e => setFormS(p => ({ ...p, name: e.target.value }))}
                         placeholder="Modérateur" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Badge emoji</label>
                  <input className="input w-full text-xl" value={formS.badge}
                         onChange={e => setFormS(p => ({ ...p, badge: e.target.value }))}
                         placeholder="🛡️" maxLength={4} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Couleur</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={formS.color}
                           onChange={e => setFormS(p => ({ ...p, color: e.target.value }))}
                           className="w-10 h-10 rounded-lg border border-[#DBCAA8] cursor-pointer" />
                    <input className="input flex-1 font-mono text-sm" value={formS.color}
                           onChange={e => setFormS(p => ({ ...p, color: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Niveau (hiérarchie)</label>
                  <input type="number" className="input w-full" value={formS.level}
                         onChange={e => setFormS(p => ({ ...p, level: parseInt(e.target.value) || 0 }))}
                         min={0} max={10} />
                  <p className="text-[10px] text-[#9AB09A] mt-1">Plus élevé = plus de droits</p>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <p className="text-xs font-semibold text-[#6B8C6A] mb-3">Permissions</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PERM_LABELS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg
                                                border border-[#DBCAA8] hover:bg-[#F2E8D5] transition-colors">
                      <input type="checkbox" className="w-4 h-4 accent-[#1A3D2B]"
                             checked={!!(formS as Record<string, unknown>)[key]}
                             onChange={e => setFormS(p => ({ ...p, [key]: e.target.checked }))} />
                      <span className="text-xs text-[#1A3D2B]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={saveStaffRank} disabled={saving}
                        className="btn-primary flex items-center gap-2 text-sm">
                  <Check size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={() => { setEditingS(null); setFormS(STAFF_INIT) }}
                        className="btn-secondary flex items-center gap-2 text-sm">
                  <X size={14} /> Annuler
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {ranks.map(r => (
              <div key={r.id}
                   className="bg-white border border-[#DBCAA8] rounded-xl px-5 py-4 flex items-center gap-4"
                   style={{ borderLeft: `4px solid ${r.color}` }}>
                <div className="text-2xl flex-shrink-0">{r.badge ?? '👤'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#1A3D2B]">{r.name}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${r.color}15`, color: r.color }}>
                      Niveau {r.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#9AB09A] mt-0.5">
                    <span className="flex items-center gap-1"><Users size={10} /> {r._count.users} admin{r._count.users !== 1 ? 's' : ''}</span>
                    <span>{Object.entries(r).filter(([k, v]) => k.startsWith('can') && v).length} permission{Object.entries(r).filter(([k, v]) => k.startsWith('can') && v).length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEditStaff(r)}
                          className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A] hover:text-[#1A3D2B]">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteRank(r.id, 'staff')}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-[#9AB09A] hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Rangs In-game ── */}
      {tab === 'ingame' && (
        <div className="space-y-4">
          {editingP && (
            <div className="bg-white border border-[#DBCAA8] rounded-xl p-6 space-y-4">
              <h2 className="font-display font-bold text-[#1A3D2B] text-base">
                {editingP === 'new' ? 'Nouveau rang in-game' : 'Modifier le rang'}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Nom *</label>
                  <input className="input w-full" value={formP.name}
                         onChange={e => setFormP(p => ({ ...p, name: e.target.value }))}
                         placeholder="VIP, Vétéran, Fondateur…" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Badge emoji</label>
                  <input className="input w-full text-xl" value={formP.badge}
                         onChange={e => setFormP(p => ({ ...p, badge: e.target.value }))}
                         placeholder="⭐" maxLength={4} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Couleur</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={formP.color}
                           onChange={e => setFormP(p => ({ ...p, color: e.target.value }))}
                           className="w-10 h-10 rounded-lg border border-[#DBCAA8] cursor-pointer" />
                    <input className="input flex-1 font-mono text-sm" value={formP.color}
                           onChange={e => setFormP(p => ({ ...p, color: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Ordre</label>
                  <input type="number" className="input w-full" value={formP.order}
                         onChange={e => setFormP(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} min={0} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Description</label>
                  <input className="input w-full" value={formP.description}
                         onChange={e => setFormP(p => ({ ...p, description: e.target.value }))}
                         placeholder="Description affichée sur le profil" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={savePlayerRank} disabled={saving}
                        className="btn-primary flex items-center gap-2 text-sm">
                  <Check size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={() => { setEditingP(null); setFormP(PLAYER_INIT) }}
                        className="btn-secondary flex items-center gap-2 text-sm">
                  <X size={14} /> Annuler
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {playerRanks.map(r => (
              <div key={r.id}
                   className="bg-white border border-[#DBCAA8] rounded-xl px-5 py-4 flex items-center gap-4"
                   style={{ borderLeft: `4px solid ${r.color}` }}>
                <div className="text-2xl flex-shrink-0">{r.badge ?? '⭐'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1A3D2B]">{r.name}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${r.color}15`, color: r.color }}>
                      {r.color}
                    </span>
                  </div>
                  <div className="text-xs text-[#9AB09A] mt-0.5 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Users size={10} /> {r._count.users} joueur{r._count.users !== 1 ? 's' : ''}</span>
                    {r.description && <span className="truncate max-w-[200px]">{r.description}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEditPlayer(r)}
                          className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A] hover:text-[#1A3D2B]">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteRank(r.id, 'player')}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-[#9AB09A] hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
