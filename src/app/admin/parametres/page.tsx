'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Shield, Map, Settings, AlertTriangle, Check, Power } from 'lucide-react'
import toast from 'react-hot-toast'

interface SiteSettings {
  maintenanceActive:  boolean
  maintenanceTitle:   string
  maintenanceMessage: string
  launchDate:         string | null
  allowedSections:    string[]
  ecoMapEnabled:      boolean
  ecoMapUrl:          string
  ecoMapTitle:        string
  siteDiscordUrl:     string
  siteServerIp:       string
  updatedBy:          string | null
}

const ALL_SECTIONS = [
  { key: 'forum',       label: '💬 Forum' },
  { key: 'tutoriels',   label: '📖 Tutoriels & Astuces' },
  { key: 'top-serveur', label: '🏆 Vote Top-Serveur' },
  { key: 'sondage',     label: '📋 Sondages' },
  { key: 'recrutement', label: '🛡️ Recrutement' },
]

export default function AdminParametresPage() {
  const [settings, setSettings]   = useState<SiteSettings | null>(null)
  const [loading,  setLoading]    = useState(true)
  const [saving,   setSaving]     = useState(false)
  const [isFounder, setIsFounder] = useState(false)
  const [tab,      setTab]        = useState<'maintenance' | 'map' | 'general'>('maintenance')

  const load = useCallback(async () => {
    setLoading(true)
    const [settingsRes, sessionRes] = await Promise.all([
      fetch('/api/settings').then(r => r.json()).catch(() => null),
      fetch('/api/admin/auth/me').then(r => r.json()).catch(() => null),
    ])
    if (settingsRes) {
      setSettings({
        ...settingsRes,
        launchDate: settingsRes.launchDate
          ? new Date(settingsRes.launchDate).toISOString().slice(0, 16)
          : '',
      })
    }
    // Vérifier si SUPER_ADMIN
    setIsFounder(sessionRes?.role === 'SUPER_ADMIN')
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function update(key: keyof SiteSettings, value: unknown) {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev)
  }

  function toggleSection(key: string) {
    if (!settings) return
    const current = settings.allowedSections
    const next = current.includes(key)
      ? current.filter(s => s !== key)
      : [...current, key]
    update('allowedSections', next)
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      const payload = {
        ...settings,
        launchDate: settings.launchDate || null,
      }
      const res = await fetch('/api/settings', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      if (res.status === 403) {
        toast.error('Réservé aux fondateurs (SUPER_ADMIN).')
        return
      }
      if (!res.ok) throw new Error()
      toast.success('Paramètres enregistrés')
    } catch {
      toast.error('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-[#1A3D2B] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A3D2B]">Paramètres</h1>
          {!isFounder && (
            <p className="text-orange-500 text-sm flex items-center gap-1.5 mt-1">
              <Shield size={14} /> Certains paramètres sont réservés aux fondateurs (SUPER_ADMIN)
            </p>
          )}
        </div>
        <button onClick={handleSave} disabled={saving || !isFounder}
                className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
          <Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-[#DBCAA8]">
        {[
          { key: 'maintenance', label: '⚙️ Maintenance', icon: <AlertTriangle size={14} /> },
          { key: 'map',         label: '🗺️ Carte Eco',   icon: <Map size={14} /> },
          { key: 'general',     label: '⚙️ Général',     icon: <Settings size={14} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    tab === t.key ? 'border-[#1A3D2B] text-[#1A3D2B]' : 'border-transparent text-[#6B8C6A] hover:text-[#1A3D2B]'
                  }`}>
            {t.label}
          </button>
        ))}
      </div>

      {!isFounder && (
        <div className="bg-[#FBF0C8] border border-[rgba(212,168,32,0.3)] rounded-xl p-4 flex items-start gap-3">
          <Shield size={18} className="text-[#A07810] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-[#A07810]">Accès Fondateur requis</p>
            <p className="text-xs text-[#6B8C6A] mt-0.5">
              Les paramètres de maintenance et de carte sont modifiables uniquement par les comptes de niveau SUPER_ADMIN.
            </p>
          </div>
        </div>
      )}

      {/* ── MAINTENANCE ── */}
      {tab === 'maintenance' && settings && (
        <div className="space-y-5">

          {/* Toggle maintenance */}
          <div className="bg-white border border-[#DBCAA8] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-[#1A3D2B] text-base flex items-center gap-2">
                  <Power size={16} className={settings.maintenanceActive ? 'text-red-500' : 'text-[#9AB09A]'} />
                  Mode maintenance
                </h2>
                <p className="text-xs text-[#6B8C6A] mt-1">
                  Redirige tout le site vers la page d'annonce. Admin toujours accessible.
                </p>
              </div>
              <button
                disabled={!isFounder}
                onClick={() => update('maintenanceActive', !settings.maintenanceActive)}
                className={`relative w-14 h-7 rounded-full transition-colors disabled:opacity-50 ${
                  settings.maintenanceActive ? 'bg-red-500' : 'bg-[#DBCAA8]'
                }`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  settings.maintenanceActive ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {settings.maintenanceActive && (
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-red-500
                              bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertTriangle size={13} />
                Maintenance ACTIVE — Le site public est en mode annonce.
              </div>
            )}
          </div>

          {/* Contenu de la page maintenance */}
          <div className="bg-white border border-[#DBCAA8] rounded-xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-[#1A3D2B] text-sm">Contenu de la page</h3>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Titre principal</label>
              <input className="input w-full" value={settings.maintenanceTitle}
                     onChange={e => update('maintenanceTitle', e.target.value)}
                     disabled={!isFounder}
                     placeholder="Saison 2 — Bientôt disponible" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Message</label>
              <textarea className="input w-full resize-none" rows={3}
                        value={settings.maintenanceMessage}
                        onChange={e => update('maintenanceMessage', e.target.value)}
                        disabled={!isFounder}
                        placeholder="Le serveur se prépare pour une nouvelle aventure…" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">
                Date de lancement (countdown)
              </label>
              <input type="datetime-local" className="input w-full"
                     value={settings.launchDate ?? ''}
                     onChange={e => update('launchDate', e.target.value)}
                     disabled={!isFounder} />
              <p className="text-[10px] text-[#9AB09A] mt-1">
                Laisser vide pour ne pas afficher de timer.
              </p>
            </div>
          </div>

          {/* Sections accessibles pendant la maintenance */}
          <div className="bg-white border border-[#DBCAA8] rounded-xl p-5">
            <h3 className="font-display font-semibold text-[#1A3D2B] text-sm mb-1">
              Sections accessibles pendant la maintenance
            </h3>
            <p className="text-xs text-[#9AB09A] mb-4">
              Ces pages restent accessibles via la page de maintenance.
            </p>
            <div className="space-y-2">
              {ALL_SECTIONS.map(s => {
                const active = settings.allowedSections.includes(s.key)
                return (
                  <label key={s.key}
                         className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 cursor-pointer
                                     transition-all ${!isFounder ? 'opacity-50 cursor-not-allowed' : ''}
                                     ${active ? 'border-[#3A7A52] bg-[rgba(58,122,82,0.06)]' : 'border-[#DBCAA8] hover:border-[#9AB09A]'}`}>
                    <span className="text-sm font-medium text-[#1A3D2B]">{s.label}</span>
                    <div className="flex items-center gap-2">
                      {active && <Check size={14} className="text-[#3A7A52]" />}
                      <input type="checkbox" checked={active} disabled={!isFounder}
                             onChange={() => toggleSection(s.key)}
                             className="w-4 h-4 accent-[#3A7A52]" />
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Prévisualisation */}
          <div className="bg-white border border-[#DBCAA8] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#6B8C6A] mb-2">Prévisualiser la page</p>
            <a href="/maintenance" target="_blank"
               className="inline-flex items-center gap-2 text-sm text-[#3A7A52] hover:underline font-semibold">
              → Ouvrir /maintenance dans un nouvel onglet
            </a>
          </div>
        </div>
      )}

      {/* ── MAP ECO ── */}
      {tab === 'map' && settings && (() => {
        // Extraire IP et port depuis l'URL stockée (ex: http://1.2.3.4:3001)
        let parsedIp   = ''
        let parsedPort = '3001'
        try {
          const u = new URL(settings.ecoMapUrl)
          parsedIp   = u.hostname
          parsedPort = u.port || '3001'
        } catch { /* URL vide ou invalide */ }

        function setMapIpPort(ip: string, port: string) {
          const clean = ip.trim()
          const p     = port.trim() || '3001'
          const url   = clean ? `http://${clean}:${p}` : ''
          update('ecoMapUrl', url)
        }

        return (
          <div className="space-y-5">
            <div className="bg-white border border-[#DBCAA8] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-[#1A3D2B] text-base flex items-center gap-2">
                    <Map size={16} className="text-[#4A9EC4]" /> Carte Eco interactive
                  </h2>
                  <p className="text-xs text-[#6B8C6A] mt-1">
                    Intègre la carte de votre serveur Eco dans la page <code className="bg-[#F2E8D5] px-1 rounded">/carte</code>.
                  </p>
                </div>
                <button
                  disabled={!isFounder}
                  onClick={() => update('ecoMapEnabled', !settings.ecoMapEnabled)}
                  className={`relative w-14 h-7 rounded-full transition-colors disabled:opacity-50 ${
                    settings.ecoMapEnabled ? 'bg-[#3A7A52]' : 'bg-[#DBCAA8]'
                  }`}
                >
                  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.ecoMapEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="bg-[#F2E8D5] border border-[#DBCAA8] rounded-xl p-4 text-xs text-[#6B8C6A]">
                <p className="font-bold text-[#1A3D2B] mb-1">ℹ️ Comment ça fonctionne ?</p>
                <p>Le serveur Eco expose une carte web intégrée. Entrez l'IP et le port de votre serveur Eco pour l'intégrer dans le site.</p>
                <p className="mt-2">Le port par défaut de la carte Eco est <strong>3001</strong>. Assurez-vous qu'il est ouvert sur votre firewall.</p>
              </div>

              {/* IP + Port séparés */}
              <div className="grid grid-cols-[1fr_140px] gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">IP du serveur Eco</label>
                  <input
                    className="input w-full font-mono text-sm"
                    value={parsedIp}
                    onChange={e => setMapIpPort(e.target.value, parsedPort)}
                    disabled={!isFounder}
                    placeholder="123.456.78.9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Port</label>
                  <input
                    className="input w-full font-mono text-sm"
                    value={parsedPort}
                    onChange={e => setMapIpPort(parsedIp, e.target.value)}
                    disabled={!isFounder}
                    placeholder="3001"
                  />
                </div>
              </div>

              {/* Aperçu URL construite */}
              {settings.ecoMapUrl && (
                <div className="flex items-center gap-2 text-xs text-[#6B8C6A] bg-[#F2E8D5] rounded-lg px-3 py-2">
                  <span className="text-[#9AB09A]">URL générée :</span>
                  <code className="text-[#1A3D2B] font-mono">{settings.ecoMapUrl}</code>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Titre de la page carte</label>
                <input className="input w-full" value={settings.ecoMapTitle}
                       onChange={e => update('ecoMapTitle', e.target.value)}
                       disabled={!isFounder}
                       placeholder="Carte du monde" />
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── GÉNÉRAL ── */}
      {tab === 'general' && settings && (
        <div className="bg-white border border-[#DBCAA8] rounded-xl p-5 space-y-4">
          <h2 className="font-display font-bold text-[#1A3D2B] text-base flex items-center gap-2">
            <Settings size={16} /> Informations générales
          </h2>
          <div>
            <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">URL Discord</label>
            <input className="input w-full" value={settings.siteDiscordUrl}
                   onChange={e => update('siteDiscordUrl', e.target.value)}
                   disabled={!isFounder}
                   placeholder="https://discord.gg/voilectia" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">IP du serveur Eco</label>
            <input className="input w-full font-mono text-sm" value={settings.siteServerIp}
                   onChange={e => update('siteServerIp', e.target.value)}
                   disabled={!isFounder}
                   placeholder="play.voilectia.fr" />
          </div>
          {settings.updatedBy && (
            <p className="text-[10px] text-[#9AB09A]">Dernière modification par : {settings.updatedBy}</p>
          )}
        </div>
      )}
    </div>
  )
}
