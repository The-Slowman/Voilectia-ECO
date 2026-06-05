'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Briefcase, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Job {
  id: string; name: string; description: string | null
  icon: string | null; color: string; order: number; active: boolean
  _count?: { users: number }
}

const INIT = { name: '', description: '', icon: '', color: '#3A7A52', order: 0, active: true }

const PRESET_COLORS = ['#3A7A52','#2D6A4F','#D4A820','#4A9EC4','#C9967A','#8B5CF6','#EF4444','#F97316']

export default function AdminJobsPage() {
  const [jobs,     setJobs]     = useState<Job[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<string | null>(null)
  const [form,     setForm]     = useState(INIT)

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/jobs')
    const data = await res.json()
    setJobs(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() { setForm(INIT); setEditing(null); setShowForm(true) }
  function openEdit(job: Job) {
    setForm({ name: job.name, description: job.description ?? '', icon: job.icon ?? '',
              color: job.color, order: job.order, active: job.active })
    setEditing(job.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url    = editing ? `/api/jobs/${editing}` : '/api/jobs'
    const method = editing ? 'PUT' : 'POST'
    const res    = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })
    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error ?? 'Erreur.')
      return
    }
    toast.success(editing ? 'Métier mis à jour.' : 'Métier créé.')
    setShowForm(false)
    load()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer le métier "${name}" ?`)) return
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Métier supprimé.'); load() }
    else toast.error('Erreur lors de la suppression.')
  }

  async function toggleActive(job: Job) {
    await fetch(`/api/jobs/${job.id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ active: !job.active }),
    })
    load()
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#E8F5EE] flex items-center gap-2">
            <Briefcase size={22} /> Métiers
          </h1>
          <p className="text-[#9DC4AD] text-sm mt-1">
            {jobs.length} métier{jobs.length > 1 ? 's' : ''} — les joueurs peuvent les sélectionner sur leur profil
          </p>
        </div>
        <button onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#52B788] text-white font-semibold text-sm hover:bg-[#3A7A52] transition-colors">
          <Plus size={16} /> Nouveau métier
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card-dark p-5 mb-6 border border-[rgba(212,168,32,0.2)]">
          <h3 className="font-semibold text-[#E8F5EE] mb-4">
            {editing ? 'Modifier le métier' : 'Créer un métier'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[#9DC4AD] mb-1">Icône (emoji)</label>
                <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                       className="input-dark text-center text-2xl" placeholder="⛏️" maxLength={4} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#9DC4AD] mb-1">Nom <span className="text-red-400">*</span></label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                       className="input-dark" placeholder="Mineur, Agriculteur, Commerçant…" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#9DC4AD] mb-1">Description</label>
              <input value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                     className="input-dark" placeholder="Courte description du métier" />
            </div>
            <div>
              <label className="block text-xs text-[#9DC4AD] mb-2">Couleur</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                          className="w-7 h-7 rounded-full border-2 transition-all"
                          style={{ background: c, borderColor: form.color === c ? 'white' : 'transparent' }} />
                ))}
                <input type="color" value={form.color}
                       onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                       className="w-7 h-7 rounded-full border-0 cursor-pointer bg-transparent" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#9DC4AD] mb-1">Ordre d'affichage</label>
                <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: +e.target.value }))}
                       className="input-dark" min={0} />
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 text-sm text-[#9DC4AD] cursor-pointer">
                  <input type="checkbox" checked={form.active}
                         onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                         className="w-4 h-4 accent-[#52B788]" />
                  Actif (visible par les joueurs)
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#52B788] text-white text-sm font-semibold hover:bg-[#3A7A52] transition-colors">
                <Check size={14} /> {editing ? 'Sauvegarder' : 'Créer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(242,232,213,0.15)] text-[#9DC4AD] text-sm hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                <X size={14} /> Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card-dark p-12 text-center text-[#5A8A6A]">
          <Briefcase size={32} className="mx-auto mb-3 opacity-40" />
          <p>Aucun métier créé. Commence par en créer un !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id}
                 className="card-dark p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                   style={{ background: `${job.color}20` }}>
                {job.icon ?? '🔧'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#E8F5EE] text-sm">{job.name}</p>
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: job.color }} />
                  {!job.active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[#5A8A6A]">
                      Inactif
                    </span>
                  )}
                </div>
                {job.description && <p className="text-[#5A8A6A] text-xs truncate">{job.description}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleActive(job)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          job.active
                            ? 'text-[#52B788] hover:bg-[rgba(82,183,136,0.1)]'
                            : 'text-[#5A8A6A] hover:bg-[rgba(255,255,255,0.06)]'
                        }`}>
                  {job.active ? '✓ Actif' : '✗ Inactif'}
                </button>
                <button onClick={() => openEdit(job)}
                        className="p-1.5 rounded-lg text-[#9DC4AD] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#E8F5EE] transition-colors">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(job.id, job.name)}
                        className="p-1.5 rounded-lg text-[#5A8A6A] hover:bg-red-900/20 hover:text-red-400 transition-colors">
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
