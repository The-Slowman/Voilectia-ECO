'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Server, Globe, Zap, Users, Coins } from 'lucide-react'
import toast from 'react-hot-toast'

interface ServerConfig {
  worldSize: string; difficulty: string; xpRate: string
  specialties: number; currency: string; season: string
  serverIp: string; serverPort: string; maxPlayers: number | null
  modpack: string; description: string
  startDate: string; endDate: string
}

const DEFAULTS: ServerConfig = {
  worldSize: '4km', difficulty: 'Normal', xpRate: 'x1',
  specialties: 5, currency: 'VLC', season: 'S1',
  serverIp: '', serverPort: '', maxPlayers: null,
  modpack: '', description: '', startDate: '', endDate: '',
}

export default function AdminServeurPage() {
  const [config,  setConfig]  = useState<ServerConfig>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetch('/api/server-config').then(r => r.json()).catch(() => null)
    if (data) {
      setConfig({
        worldSize:   data.worldSize   ?? DEFAULTS.worldSize,
        difficulty:  data.difficulty  ?? DEFAULTS.difficulty,
        xpRate:      data.xpRate      ?? DEFAULTS.xpRate,
        specialties: data.specialties ?? DEFAULTS.specialties,
        currency:    data.currency    ?? DEFAULTS.currency,
        season:      data.season      ?? DEFAULTS.season,
        serverIp:    data.serverIp    ?? '',
        serverPort:  data.serverPort  ?? '',
        maxPlayers:  data.maxPlayers  ?? null,
        modpack:     data.modpack     ?? '',
        description: data.description ?? '',
        startDate:   data.startDate ? new Date(data.startDate).toISOString().slice(0, 10) : '',
        endDate:     data.endDate   ? new Date(data.endDate).toISOString().slice(0, 10)   : '',
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const f = (k: keyof ServerConfig, v: unknown) => setConfig(p => ({ ...p, [k]: v }))

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/server-config', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          specialties: Number(config.specialties),
          maxPlayers:  config.maxPlayers ? Number(config.maxPlayers) : null,
          startDate:   config.startDate || null,
          endDate:     config.endDate   || null,
        }),
      })
      if (res.ok) toast.success('Configuration enregistrée !')
      else toast.error('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#E8F5EE] flex items-center gap-2">
            <Server size={22} className="text-[#52B788]" /> Configuration du serveur
          </h1>
          <p className="text-[#9DC4AD] text-sm mt-1">
            Informations affichées publiquement sur la page /serveur
          </p>
        </div>
        <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-[#52B788] hover:bg-[#3A7A52] text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors">
          <Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {/* Infos jeu */}
      <section className="card-dark p-6 space-y-4">
        <h2 className="font-semibold text-[#E8F5EE] text-sm flex items-center gap-2">
          <Globe size={14} className="text-[#52B788]" /> Paramètres de jeu
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5">Taille du monde</label>
            <select value={config.worldSize} onChange={e => f('worldSize', e.target.value)}
                    className="input-dark w-full">
              {['2km','4km','8km','12km','16km'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5">Difficulté</label>
            <select value={config.difficulty} onChange={e => f('difficulty', e.target.value)}
                    className="input-dark w-full">
              {['Facile','Normal','Difficile','Survie'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5">Taux d'XP</label>
            <select value={config.xpRate} onChange={e => f('xpRate', e.target.value)}
                    className="input-dark w-full">
              {['x0.5','x1','x1.5','x2','x3','x5','x10'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5">Nb. de spécialités</label>
            <input type="number" min={1} max={20} value={config.specialties}
                   onChange={e => f('specialties', parseInt(e.target.value))}
                   className="input-dark w-full" />
          </div>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5 flex items-center gap-1">
              <Coins size={11} /> Monnaie
            </label>
            <input value={config.currency} onChange={e => f('currency', e.target.value)}
                   className="input-dark w-full" placeholder="VLC" />
          </div>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5">Saison</label>
            <input value={config.season} onChange={e => f('season', e.target.value)}
                   className="input-dark w-full" placeholder="S1" />
          </div>
        </div>
      </section>

      {/* Connexion */}
      <section className="card-dark p-6 space-y-4">
        <h2 className="font-semibold text-[#E8F5EE] text-sm flex items-center gap-2">
          <Zap size={14} className="text-[#52B788]" /> Connexion & technique
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5">IP du serveur</label>
            <input value={config.serverIp} onChange={e => f('serverIp', e.target.value)}
                   className="input-dark w-full font-mono text-sm" placeholder="play.voilectia.fr" />
          </div>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5">Port</label>
            <input value={config.serverPort} onChange={e => f('serverPort', e.target.value)}
                   className="input-dark w-full font-mono text-sm" placeholder="3000" />
          </div>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5 flex items-center gap-1">
              <Users size={11} /> Joueurs max
            </label>
            <input type="number" min={1} value={config.maxPlayers ?? ''}
                   onChange={e => f('maxPlayers', e.target.value ? parseInt(e.target.value) : null)}
                   className="input-dark w-full" placeholder="30" />
          </div>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5">Modpack (nom)</label>
            <input value={config.modpack} onChange={e => f('modpack', e.target.value)}
                   className="input-dark w-full" placeholder="Eco v0.11.x" />
          </div>
        </div>
      </section>

      {/* Saison */}
      <section className="card-dark p-6 space-y-4">
        <h2 className="font-semibold text-[#E8F5EE] text-sm">Dates de la saison</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5">Début de saison</label>
            <input type="date" value={config.startDate}
                   onChange={e => f('startDate', e.target.value)}
                   className="input-dark w-full" />
          </div>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5">Fin de saison (estimation)</label>
            <input type="date" value={config.endDate}
                   onChange={e => f('endDate', e.target.value)}
                   className="input-dark w-full" />
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="card-dark p-6 space-y-4">
        <h2 className="font-semibold text-[#E8F5EE] text-sm">Description du serveur</h2>
        <textarea value={config.description} onChange={e => f('description', e.target.value)}
                  rows={5} className="input-dark w-full resize-none"
                  placeholder="Présentez le serveur, ses règles, son ambiance…" />
      </section>
    </div>
  )
}
