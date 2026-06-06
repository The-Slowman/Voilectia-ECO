'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, TrendingUp, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

interface Progression {
  id: string; jobName: string; unlockDay: number
  description: string | null; icon: string | null
  color: string; order: number
}

const INIT = { jobName: '', unlockDay: 1, description: '', icon: '', color: '#3A7A52', order: 0 }

const PRESETS = [
  { jobName: 'Charpentier', unlockDay: 1,  icon: '🪵', color: '#8B5E3C' },
  { jobName: 'Fermier',     unlockDay: 1,  icon: '🌾', color: '#6B8C3A' },
  { jobName: 'Cuisinier',   unlockDay: 2,  icon: '🍳', color: '#E87A30' },
  { jobName: 'Maçon',       unlockDay: 3,  icon: '🧱', color: '#8C7A52' },
  { jobName: 'Mécanique',   unlockDay: 7,  icon: '⚙️', color: '#7A8C9D' },
  { jobName: 'Industrie',   unlockDay: 10, icon: '🏭', color: '#5A7A8C' },
  { jobName: 'Pétrole',     unlockDay: 12, icon: '🛢️', color: '#3A4A5C' },
  { jobName: 'Électronique',unlockDay: 12, icon: '💡', color: '#D4A820' },
]

export default function AdminProgressionPage() {
  const [items,    setItems]    = useState<Progression[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<string | null>(null)
  const [form,     setForm]     = useState(INIT)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetch('/api/server-config/progressions').then(r => r.json()).catch(() => [])
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const f = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url    = editing ? `/api/server-config/progressions/${editing}` : '/api/server-config/progressions'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, unlockDay: Number(form.unlockDay), order: Number(form.order) }),
    })
    if (res.ok) {
      toast.success(editing ? 'Mis à jour' : 'Ajouté')
      setShowForm(false); setEditing(null); setForm(INIT); load()
    } else toast.error('Erreur')
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ?`)) return
    await fetch(`/api/server-config/progressions/${id}`, { method: 'DELETE' })
    toast.success('Supprimé'); load()
  }

  function startEdit(p: Progression) {
    setForm({ jobName: p.jobName, unlockDay: p.unlockDay, description: p.description ?? '', icon: p.icon ?? '', color: p.color, order: p.order })
    setEditing(p.id); setShowForm(true)
  }

  function loadPreset(preset: typeof PRESETS[0]) {
    setForm(prev => ({ ...prev, ...preset, description: '' }))
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#E8F5EE] flex items-center gap-2">
            <TrendingUp size={22} className="text-[#52B788]" /> Progression des métiers
          </h1>
          <p className="text-[#9DC4AD] text-sm mt-1">Affichage public sur /progression — Jour de déblocage de chaque spécialité</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(INIT) }}
                className="flex items-center gap-2 bg-[#52B788] hover:bg-[#3A7A52] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {/* Presets rapides */}
      {!showForm && (
        <div className="card-dark p-4">
          <p className="text-xs text-[#9DC4AD] mb-3">⚡ Presets courants — cliquez pour préremplir</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(preset => (
              <button key={preset.jobName}
                      onClick={() => { setShowForm(true); setEditing(null); loadPreset(preset) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[rgba(82,183,136,0.15)] text-[#9DC4AD] hover:border-[rgba(82,183,136,0.35)] hover:text-[#E8F5EE] transition-all">
                {preset.icon} {preset.jobName} — Jour {preset.unlockDay}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-dark p-6 space-y-4">
          <h2 className="font-semibold text-[#E8F5EE]">{editing ? 'Modifier' : 'Nouveau métier/spécialité'}</h2>

          {/* Presets dans le form */}
          <div>
            <p className="text-xs text-[#9DC4AD] mb-2">Preset :</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(preset => (
                <button type="button" key={preset.jobName}
                        onClick={() => loadPreset(preset)}
                        className="px-2 py-1 rounded text-[10px] border border-[rgba(82,183,136,0.15)] text-[#9DC4AD] hover:border-[rgba(82,183,136,0.35)] transition-all">
                  {preset.icon} {preset.jobName}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#9DC4AD] mb-1">Nom du métier *</label>
              <input required value={form.jobName} onChange={e => f('jobName', e.target.value)}
                     className="input-dark w-full" placeholder="Mécanique" />
            </div>
            <div>
              <label className="block text-xs text-[#9DC4AD] mb-1">Jour de déblocage *</label>
              <input required type="number" min={1} max={365} value={form.unlockDay}
                     onChange={e => f('unlockDay', parseInt(e.target.value))}
                     className="input-dark w-full" placeholder="7" />
            </div>
            <div>
              <label className="block text-xs text-[#9DC4AD] mb-1">Icône (emoji)</label>
              <input value={form.icon} onChange={e => f('icon', e.target.value)}
                     className="input-dark w-full" placeholder="⚙️" maxLength={4} />
            </div>
            <div>
              <label className="block text-xs text-[#9DC4AD] mb-1">Couleur</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color} onChange={e => f('color', e.target.value)}
                       className="w-10 h-9 rounded cursor-pointer border-0 bg-transparent" />
                <input value={form.color} onChange={e => f('color', e.target.value)}
                       className="input-dark flex-1 font-mono text-sm" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1">Description courte</label>
            <input value={form.description} onChange={e => f('description', e.target.value)}
                   className="input-dark w-full" placeholder="Déblocage des tables de travail avancées…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit"
                    className="bg-[#52B788] hover:bg-[#3A7A52] text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors">
              {editing ? 'Mettre à jour' : 'Créer'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }}
                    className="text-[#9DC4AD] hover:text-[#E8F5EE] px-4 py-2 text-sm">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="card-dark p-10 text-center text-[#5A8A6A]">
          Aucune progression définie. Ajoutez les métiers de votre serveur.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id}
                 className="card-dark p-4 flex items-center gap-4">
              <div className="flex-shrink-0 text-[#5A8A6A]">
                <GripVertical size={14} />
              </div>

              {/* Jour badge */}
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-[10px] text-[#5A8A6A] uppercase tracking-wide mb-0.5">Jour</div>
                <div className="font-display font-bold text-2xl"
                     style={{ color: item.color }}>{item.unlockDay}</div>
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  <span className="font-semibold text-[#E8F5EE]">{item.jobName}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-[#9DC4AD] mt-0.5 truncate">{item.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(item)}
                        className="p-1.5 text-[#5A8A6A] hover:text-[#52B788] transition-colors">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(item.id, item.jobName)}
                        className="p-1.5 text-[#5A8A6A] hover:text-red-400 transition-colors">
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
