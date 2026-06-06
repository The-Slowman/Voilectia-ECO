'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Gift, Users, Trophy, Eye, EyeOff, Shuffle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Giveaway {
  id: string; title: string; description: string; prize: string
  image: string | null; endDate: string; published: boolean; ended: boolean
  winnerName: string | null; _count: { entries: number }
}

const INIT = { title: '', description: '', prize: '', image: '', endDate: '', published: false }

export default function AdminGiveawaysPage() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [editing,   setEditing]   = useState<string | null>(null)
  const [form,      setForm]      = useState(INIT)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetch('/api/giveaways?published=false').then(r => r.json()).catch(() => [])
    setGiveaways(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const f = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url    = editing ? `/api/giveaways/${editing}` : '/api/giveaways'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, endDate: new Date(form.endDate).toISOString() }),
    })
    if (res.ok) {
      toast.success(editing ? 'Mis à jour' : 'Giveaway créé !')
      setShowForm(false); setEditing(null); setForm(INIT); load()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? 'Erreur')
    }
  }

  async function togglePublish(g: Giveaway) {
    const res = await fetch(`/api/giveaways/${g.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !g.published }),
    })
    if (res.ok) { toast.success(g.published ? 'Dépublié' : 'Publié'); load() }
    else toast.error('Erreur')
  }

  async function drawWinner(g: Giveaway) {
    if (!confirm(`Tirer le gagnant pour "${g.title}" ? L'action est irréversible.`)) return
    const res = await fetch(`/api/giveaways/${g.id}/draw`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      toast.success(`🎉 Gagnant : ${data.winner.playerName}`)
      load()
    } else toast.error('Erreur lors du tirage')
  }

  async function deleteGiveaway(id: string) {
    if (!confirm('Supprimer définitivement ce giveaway ?')) return
    const res = await fetch(`/api/giveaways/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Supprimé'); load() }
    else toast.error('Réservé au Super Admin.')
  }

  function startEdit(g: Giveaway) {
    setForm({
      title: g.title, description: g.description, prize: g.prize,
      image: g.image ?? '', published: g.published,
      endDate: new Date(g.endDate).toISOString().slice(0, 16),
    })
    setEditing(g.id); setShowForm(true)
  }

  const now = new Date()

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#E8F5EE] flex items-center gap-2">
            <Gift size={22} className="text-[#D4A820]" /> Giveaways
          </h1>
          <p className="text-[#9DC4AD] text-sm mt-1">Gérez les concours et tirages au sort</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(INIT) }}
                className="flex items-center gap-2 bg-[#D4A820] hover:bg-[#A07810] text-[#1A3D2B] font-bold px-4 py-2 rounded-xl text-sm transition-colors">
          <Plus size={14} /> Créer un giveaway
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-dark p-6 space-y-4">
          <h2 className="font-semibold text-[#E8F5EE]">{editing ? 'Modifier' : 'Nouveau giveaway'}</h2>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1">Titre *</label>
            <input required value={form.title} onChange={e => f('title', e.target.value)}
                   className="input-dark w-full" placeholder="Giveaway de lancement Saison 1" />
          </div>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1">Prix à gagner *</label>
            <input required value={form.prize} onChange={e => f('prize', e.target.value)}
                   className="input-dark w-full" placeholder="1000 VLC + Rang VIP" />
          </div>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1">Description *</label>
            <textarea required value={form.description} onChange={e => f('description', e.target.value)}
                      rows={3} className="input-dark w-full resize-none"
                      placeholder="Participez pour gagner…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#9DC4AD] mb-1">Date de fin *</label>
              <input required type="datetime-local" value={form.endDate}
                     onChange={e => f('endDate', e.target.value)}
                     className="input-dark w-full" />
            </div>
            <div>
              <label className="block text-xs text-[#9DC4AD] mb-1">Image (URL)</label>
              <input value={form.image} onChange={e => f('image', e.target.value)}
                     className="input-dark w-full" placeholder="https://…" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="gpub" checked={form.published}
                   onChange={e => f('published', e.target.checked)}
                   className="w-4 h-4 accent-[#52B788]" />
            <label htmlFor="gpub" className="text-sm text-[#9DC4AD]">Publier immédiatement</label>
          </div>
          <div className="flex gap-3">
            <button type="submit"
                    className="bg-[#52B788] hover:bg-[#3A7A52] text-white px-6 py-2 rounded-xl text-sm font-semibold">
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
      ) : giveaways.length === 0 ? (
        <div className="card-dark p-10 text-center text-[#5A8A6A]">
          Aucun giveaway. Créez le premier !
        </div>
      ) : (
        <div className="space-y-3">
          {giveaways.map(g => {
            const isExpired = new Date(g.endDate) < now
            return (
              <div key={g.id} className="card-dark p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(212,168,32,0.1)] flex items-center justify-center flex-shrink-0">
                    <Gift size={18} className="text-[#D4A820]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#E8F5EE]">{g.title}</span>
                      {g.ended && (
                        <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full font-bold">
                          🎉 Terminé
                        </span>
                      )}
                      {!g.ended && isExpired && (
                        <span className="text-[10px] bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded-full">
                          ⏰ Expiré
                        </span>
                      )}
                      {!g.ended && !isExpired && g.published && (
                        <span className="text-[10px] bg-[rgba(82,183,136,0.15)] text-[#52B788] px-2 py-0.5 rounded-full">
                          ✅ En cours
                        </span>
                      )}
                      {!g.published && (
                        <span className="text-[10px] bg-[rgba(255,255,255,0.05)] text-[#5A8A6A] px-2 py-0.5 rounded-full">
                          Brouillon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9DC4AD] mt-0.5">🏆 {g.prize}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-[#5A8A6A] flex items-center gap-1">
                        <Users size={10} /> {g._count.entries} participant{g._count.entries > 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] text-[#5A8A6A]">
                        Fin : {new Date(g.endDate).toLocaleDateString('fr-FR')}
                      </span>
                      {g.winnerName && (
                        <span className="text-[10px] text-[#D4A820] flex items-center gap-1">
                          <Trophy size={10} /> {g.winnerName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Publier/dépublier */}
                    <button onClick={() => togglePublish(g)} title={g.published ? 'Dépublier' : 'Publier'}
                            className="p-1.5 text-[#5A8A6A] hover:text-[#52B788] transition-colors">
                      {g.published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    {/* Tirer au sort */}
                    {!g.ended && g._count.entries > 0 && (
                      <button onClick={() => drawWinner(g)} title="Tirer au sort"
                              className="p-1.5 text-[#5A8A6A] hover:text-[#D4A820] transition-colors">
                        <Shuffle size={14} />
                      </button>
                    )}
                    <button onClick={() => startEdit(g)}
                            className="p-1.5 text-[#5A8A6A] hover:text-[#52B788] transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => deleteGiveaway(g.id)}
                            className="p-1.5 text-[#5A8A6A] hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
