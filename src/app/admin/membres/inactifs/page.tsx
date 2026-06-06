'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, UserX, RefreshCw, Download, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { BannedBadge } from '@/components/admin/AdminBadge'

interface InactiveMember {
  id: string; name: string; email: string; role: string
  createdAt: string; lastLoginAt: string | null; banned: boolean
  ecoName: string | null; _daysInactive: number
}

const FILTERS = [
  { label: '7 jours',  days: 7  },
  { label: '14 jours', days: 14 },
  { label: '30 jours', days: 30 },
  { label: '60 jours', days: 60 },
  { label: '90 jours', days: 90 },
]

function fmtDate(d: string | null) {
  if (!d) return 'Jamais connecte'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function inactiveDays(lastLogin: string | null, createdAt: string): number {
  const ref = lastLogin ? new Date(lastLogin) : new Date(createdAt)
  return Math.floor((Date.now() - ref.getTime()) / 86400000)
}
function InactiveBar({ days }: { days: number }) {
  const pct = Math.min(100, (days / 90) * 100)
  const color = days > 60 ? 'var(--adm-red)' : days > 30 ? 'var(--adm-orange)' : 'var(--adm-gold)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--adm-surface-3)', borderRadius: 2, overflow: 'hidden', minWidth: 60 }}>
        <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 12, color, fontWeight: 600, minWidth: 40, textAlign: 'right' }}>{days}j</span>
    </div>
  )
}

export default function AdminInactifsPage() {
  const [threshold, setThreshold] = useState(30)
  const [members,   setMembers]   = useState<InactiveMember[]>([])
  const [loading,   setLoading]   = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/members/inactive?days=' + threshold)
    const data = await res.json()
    const enriched = (data.members ?? []).map((m: InactiveMember) => ({
      ...m, _daysInactive: inactiveDays(m.lastLoginAt, m.createdAt),
    })).sort((a: InactiveMember, b: InactiveMember) => b._daysInactive - a._daysInactive)
    setMembers(enriched)
    setLoading(false)
  }, [threshold])

  useEffect(() => { load() }, [load])

  async function banMember(m: InactiveMember) {
    if (!confirm('Bannir ' + m.name + ' ?')) return
    const res = await fetch('/api/admin/members/' + m.id, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ banned: true }),
    })
    if (res.ok) { toast.success(m.name + ' banni'); load() }
    else toast.error('Erreur')
  }

  const exportCSV = () => {
    const rows = [
      ['Pseudo', 'Email', 'Pseudo Eco', 'Inscription', 'Derniere connexion', 'Jours inactif', 'Banni'].join(','),
      ...members.map(m => [
        m.name, m.email, m.ecoName ?? '',
        fmtDate(m.createdAt), fmtDate(m.lastLoginAt),
        m._daysInactive, m.banned ? 'Oui' : 'Non',
      ].map(v => '"' + v + '"').join(','))
    ].join('\n')
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'inactifs-' + threshold + 'j.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.success('Export CSV telecharge')
  }

  return (
    <div className="adm-fade-in">
      <div className="adm-page-header">
        <div>
          <div style={{ marginBottom: 6 }}>
            <Link href="/admin/membres" className="adm-btn adm-btn-ghost adm-btn-xs">
              <ArrowLeft size={11} /> Membres
            </Link>
          </div>
          <h1 className="adm-page-title">Joueurs inactifs</h1>
          <p className="adm-page-subtitle">
            {members.length} joueur{members.length !== 1 ? 's' : ''} inactif depuis plus de {threshold} jours
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon"><RefreshCw size={13} /></button>
          <button onClick={exportCSV} className="adm-btn adm-btn-ghost adm-btn-sm"><Download size={13} /> Exporter CSV</button>
        </div>
      </div>

      <div className="adm-alert adm-alert-info" style={{ marginBottom: 20 }}>
        <AlertTriangle size={14} style={{ flexShrink: 0 }} />
        <div>
          <strong>Module de detection des inactifs</strong> — La date de reference est la derniere connexion, ou la date inscription si jamais connecte.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f.days}
            onClick={() => setThreshold(f.days)}
            className={'adm-btn adm-btn-sm ' + (threshold === f.days ? 'adm-btn-secondary' : 'adm-btn-ghost')}
            style={threshold === f.days ? { borderColor: 'var(--adm-orange)', color: 'var(--adm-orange)' } : {}}
          >
            <Clock size={11} /> {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="adm-table-wrap" style={{ padding: '40px 24px' }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div className="adm-skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="adm-skeleton" style={{ height: 13, width: '35%', marginBottom: 6 }} />
                <div className="adm-skeleton" style={{ height: 11, width: '55%' }} />
              </div>
              <div className="adm-skeleton" style={{ height: 4, width: 120, borderRadius: 2 }} />
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="adm-table-wrap">
          <AdminEmptyState
            icon="checkmark"
            title={'Aucun inactif depuis ' + threshold + ' jours'}
            desc="Tous les joueurs se sont connectes recemment."
          />
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Joueur</th>
                <th className="adm-col-lg">Pseudo Eco</th>
                <th>Inscription</th>
                <th>Derniere connexion</th>
                <th style={{ minWidth: 160 }}>Inactivite</th>
                <th>Statut</th>
                <th style={{ width: 50 }} />
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'var(--adm-surface-3)', border: '1px solid var(--adm-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: 'var(--adm-text-3)', flexShrink: 0,
                      }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--adm-text-1)', fontSize: 13 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--adm-text-3)' }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="adm-col-lg" style={{ fontSize: 12, color: 'var(--adm-text-2)' }}>
                    {m.ecoName ?? <span style={{ color: 'var(--adm-text-4)' }}>-</span>}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--adm-text-3)' }}>{fmtDate(m.createdAt)}</td>
                  <td style={{ fontSize: 12, color: m.lastLoginAt ? 'var(--adm-text-2)' : 'var(--adm-red)' }}>
                    {fmtDate(m.lastLoginAt)}
                  </td>
                  <td><InactiveBar days={m._daysInactive} /></td>
                  <td><BannedBadge banned={m.banned} /></td>
                  <td>
                    {!m.banned && (
                      <button
                        onClick={() => banMember(m)}
                        className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-xs"
                        title="Bannir"
                        style={{ color: 'var(--adm-red)' }}
                      >
                        <UserX size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
