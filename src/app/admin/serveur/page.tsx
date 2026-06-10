'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Server, Plus, Trash2, Check, X, Eye, EyeOff, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

interface Item {
  id: string; label: string; value: string
  description: string | null; icon: string | null; order: number; isPublic: boolean
}
interface Group { id: string; title: string; icon: string | null; order: number; items: Item[] }

interface Structured {
  serverIp: string; serverPort: string; ecoVersion: string; modpack: string
  season: string; status: string; currency: string
  discordUrl: string; topServeurUrl: string
  maxPlayers: string; startDate: string; endDate: string; description: string
}

const STATUS_OPTIONS = [
  { value: 'preparation', label: 'En preparation' },
  { value: 'open',        label: 'Ouvert' },
  { value: 'closed',      label: 'Ferme' },
  { value: 'maintenance', label: 'Maintenance' },
]

const EMPTY: Structured = {
  serverIp: '', serverPort: '', ecoVersion: '', modpack: '',
  season: '', status: 'preparation', currency: 'VLC',
  discordUrl: '', topServeurUrl: '',
  maxPlayers: '', startDate: '', endDate: '', description: '',
}

export default function AdminServeurPage() {
  const [cfg,     setCfg]     = useState<Structured>(EMPTY)
  const [groups,  setGroups]  = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [newGroup, setNewGroup] = useState({ title: '', icon: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const d = await fetch('/api/server-config').then(r => r.json()).catch(() => null)
    if (d) {
      setCfg({
        serverIp: d.serverIp ?? '', serverPort: d.serverPort ?? '', ecoVersion: d.ecoVersion ?? '',
        modpack: d.modpack ?? '', season: d.season ?? '', status: d.status ?? 'preparation',
        currency: d.currency ?? 'VLC', discordUrl: d.discordUrl ?? '', topServeurUrl: d.topServeurUrl ?? '',
        maxPlayers: d.maxPlayers != null ? String(d.maxPlayers) : '',
        startDate: d.startDate ? new Date(d.startDate).toISOString().slice(0, 10) : '',
        endDate:   d.endDate   ? new Date(d.endDate).toISOString().slice(0, 10)   : '',
        description: d.description ?? '',
      })
      setGroups(d.groups ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const f = (k: keyof Structured, v: string) => setCfg(p => ({ ...p, [k]: v }))

  async function saveStructured() {
    setSaving(true)
    try {
      const res = await fetch('/api/server-config', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverIp: cfg.serverIp || null, serverPort: cfg.serverPort || null,
          ecoVersion: cfg.ecoVersion || null, modpack: cfg.modpack || null,
          season: cfg.season || undefined, status: cfg.status,
          currency: cfg.currency || undefined,
          discordUrl: cfg.discordUrl || null, topServeurUrl: cfg.topServeurUrl || null,
          maxPlayers: cfg.maxPlayers ? Number(cfg.maxPlayers) : null,
          startDate: cfg.startDate || null, endDate: cfg.endDate || null,
          description: cfg.description || null,
        }),
      })
      if (res.ok) toast.success('Configuration enregistree')
      else { const e = await res.json().catch(() => ({})); toast.error(e.error ?? 'Erreur') }
    } finally { setSaving(false) }
  }

  async function addGroup() {
    if (!newGroup.title.trim()) { toast.error('Titre requis'); return }
    const res = await fetch('/api/server-config/groups', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newGroup.title, icon: newGroup.icon || null, order: groups.length + 1 }),
    })
    if (res.ok) { toast.success('Groupe ajoute'); setNewGroup({ title: '', icon: '' }); load() }
    else toast.error('Erreur')
  }
  async function saveGroup(g: Group) {
    const res = await fetch(`/api/server-config/groups/${g.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: g.title, icon: g.icon || null, order: g.order }),
    })
    if (res.ok) toast.success('Groupe enregistre'); else toast.error('Erreur')
  }
  async function deleteGroup(id: string) {
    if (!confirm('Supprimer ce groupe et toutes ses lignes ?')) return
    const res = await fetch(`/api/server-config/groups/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Groupe supprime'); load() } else toast.error('Erreur')
  }
  function patchGroupLocal(id: string, patch: Partial<Group>) {
    setGroups(gs => gs.map(g => g.id === id ? { ...g, ...patch } : g))
  }

  async function addItem(groupId: string) {
    const g = groups.find(x => x.id === groupId)
    const res = await fetch('/api/server-config/items', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, label: 'Nouveau parametre', value: '-', order: (g?.items.length ?? 0) + 1, isPublic: true }),
    })
    if (res.ok) { load() } else toast.error('Erreur')
  }
  async function saveItem(it: Item) {
    if (!it.label.trim() || !it.value.trim()) { toast.error('Libelle et valeur requis'); return }
    const res = await fetch(`/api/server-config/items/${it.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: it.label, value: it.value, description: it.description || null, icon: it.icon || null, order: it.order, isPublic: it.isPublic }),
    })
    if (res.ok) toast.success('Ligne enregistree'); else toast.error('Erreur')
  }
  async function deleteItem(id: string) {
    const res = await fetch(`/api/server-config/items/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Ligne supprimee'); load() } else toast.error('Erreur')
  }
  function patchItemLocal(groupId: string, itemId: string, patch: Partial<Item>) {
    setGroups(gs => gs.map(g => g.id === groupId
      ? { ...g, items: g.items.map(it => it.id === itemId ? { ...it, ...patch } : it) }
      : g))
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div className="w-8 h-8 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const lab = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--adm-text-3)', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Server size={20} /> Configuration du serveur
          </h1>
          <p className="adm-page-subtitle">Champs structures + blocs personnalisables affiches sur /configuration</p>
        </div>
        <button onClick={saveStructured} disabled={saving} className="adm-btn adm-btn-primary">
          <Save size={13} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      <div className="adm-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, color: 'var(--adm-text-1)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>🔌 Connexion & saison</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          <div><label style={lab}>IP serveur</label><input className="adm-input" value={cfg.serverIp} onChange={e => f('serverIp', e.target.value)} placeholder="play.voilectia.fr" /></div>
          <div><label style={lab}>Port</label><input className="adm-input" value={cfg.serverPort} onChange={e => f('serverPort', e.target.value)} placeholder="3003" /></div>
          <div><label style={lab}>Version Eco</label><input className="adm-input" value={cfg.ecoVersion} onChange={e => f('ecoVersion', e.target.value)} placeholder="0.13.x" /></div>
          <div><label style={lab}>Modpack</label><input className="adm-input" value={cfg.modpack} onChange={e => f('modpack', e.target.value)} placeholder="Voilectia S2" /></div>
          <div><label style={lab}>Saison</label><input className="adm-input" value={cfg.season} onChange={e => f('season', e.target.value)} placeholder="S2" /></div>
          <div>
            <label style={lab}>Statut</label>
            <select className="adm-input" value={cfg.status} onChange={e => f('status', e.target.value)}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div><label style={lab}>Monnaie</label><input className="adm-input" value={cfg.currency} onChange={e => f('currency', e.target.value)} placeholder="VLC" /></div>
          <div><label style={lab}>Joueurs max</label><input className="adm-input" type="number" value={cfg.maxPlayers} onChange={e => f('maxPlayers', e.target.value)} placeholder="-" /></div>
          <div><label style={lab}>Lien Discord</label><input className="adm-input" value={cfg.discordUrl} onChange={e => f('discordUrl', e.target.value)} placeholder="https://discord.gg/..." /></div>
          <div><label style={lab}>Lien Top-Serveur</label><input className="adm-input" value={cfg.topServeurUrl} onChange={e => f('topServeurUrl', e.target.value)} placeholder="https://top-serveur.fr/..." /></div>
          <div><label style={lab}>Debut de saison</label><input className="adm-input" type="date" value={cfg.startDate} onChange={e => f('startDate', e.target.value)} /></div>
          <div><label style={lab}>Fin estimee</label><input className="adm-input" type="date" value={cfg.endDate} onChange={e => f('endDate', e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={lab}>Description (intro de la page)</label>
          <textarea className="adm-input" rows={3} value={cfg.description} onChange={e => f('description', e.target.value)} placeholder="Presentation courte du serveur..." />
        </div>
        <p style={{ fontSize: 11, color: 'var(--adm-text-4)', marginTop: 8 }}>
          Ces champs alimentent les cartes Connexion et Saison. Pense a cliquer Enregistrer en haut.
        </p>
      </div>

      <div className="adm-page-header" style={{ marginTop: 8 }}>
        <div>
          <h2 className="adm-page-title" style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Layers size={16} /> Blocs de configuration</h2>
          <p className="adm-page-subtitle">Chaque bloc devient une carte sur la page publique. Ajoute autant de lignes que tu veux.</p>
        </div>
      </div>

      {groups.length === 0 && (
        <AdminEmptyState icon="🧩" title="Aucun bloc" desc="Cree un premier bloc (ex. Monde, Progression, Economie...)." />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {groups.map(g => (
          <div key={g.id} className="adm-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <input className="adm-input" style={{ width: 60, textAlign: 'center', fontSize: 18 }} value={g.icon ?? ''} onChange={e => patchGroupLocal(g.id, { icon: e.target.value })} placeholder="🌍" maxLength={4} />
              <input className="adm-input" style={{ flex: 1, minWidth: 140, fontWeight: 600 }} value={g.title} onChange={e => patchGroupLocal(g.id, { title: e.target.value })} placeholder="Nom du bloc" />
              <input className="adm-input" style={{ width: 70 }} type="number" value={g.order} onChange={e => patchGroupLocal(g.id, { order: parseInt(e.target.value) || 0 })} title="Ordre" />
              <button onClick={() => saveGroup(g)} className="adm-btn adm-btn-ghost adm-btn-sm" title="Enregistrer le bloc"><Check size={12} /></button>
              <button onClick={() => deleteGroup(g.id)} className="adm-btn adm-btn-danger adm-btn-sm" title="Supprimer le bloc"><Trash2 size={12} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {g.items.map(it => (
                <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', padding: '6px 8px', background: 'var(--adm-surface-2)', borderRadius: 6 }}>
                  <input className="adm-input" style={{ width: 50, textAlign: 'center' }} value={it.icon ?? ''} onChange={e => patchItemLocal(g.id, it.id, { icon: e.target.value })} placeholder="🔧" maxLength={4} />
                  <input className="adm-input" style={{ width: 150 }} value={it.label} onChange={e => patchItemLocal(g.id, it.id, { label: e.target.value })} placeholder="Libelle" />
                  <input className="adm-input" style={{ width: 150 }} value={it.value} onChange={e => patchItemLocal(g.id, it.id, { value: e.target.value })} placeholder="Valeur" />
                  <input className="adm-input" style={{ flex: 1, minWidth: 120 }} value={it.description ?? ''} onChange={e => patchItemLocal(g.id, it.id, { description: e.target.value })} placeholder="Description (optionnel)" />
                  <input className="adm-input" style={{ width: 60 }} type="number" value={it.order} onChange={e => patchItemLocal(g.id, it.id, { order: parseInt(e.target.value) || 0 })} title="Ordre" />
                  <button onClick={() => patchItemLocal(g.id, it.id, { isPublic: !it.isPublic })} className="adm-btn adm-btn-ghost adm-btn-sm" title={it.isPublic ? 'Visible' : 'Masque'}>
                    {it.isPublic ? <Eye size={12} /> : <EyeOff size={12} style={{ opacity: 0.5 }} />}
                  </button>
                  <button onClick={() => saveItem(it)} className="adm-btn adm-btn-ghost adm-btn-sm" title="Enregistrer"><Check size={12} /></button>
                  <button onClick={() => deleteItem(it.id)} className="adm-btn adm-btn-danger adm-btn-sm" title="Supprimer"><X size={12} /></button>
                </div>
              ))}
              <button onClick={() => addItem(g.id)} className="adm-btn adm-btn-ghost adm-btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                <Plus size={12} /> Ajouter une ligne
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-card" style={{ padding: 16, marginTop: 14, display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ width: 70 }}><label style={lab}>Icone</label><input className="adm-input" style={{ textAlign: 'center', fontSize: 18 }} value={newGroup.icon} onChange={e => setNewGroup(p => ({ ...p, icon: e.target.value }))} placeholder="🌍" maxLength={4} /></div>
        <div style={{ flex: 1, minWidth: 160 }}><label style={lab}>Nouveau bloc</label><input className="adm-input" value={newGroup.title} onChange={e => setNewGroup(p => ({ ...p, title: e.target.value }))} placeholder="Monde, Progression, Economie..." /></div>
        <button onClick={addGroup} className="adm-btn adm-btn-primary"><Plus size={13} /> Ajouter le bloc</button>
      </div>
    </div>
  )
}
