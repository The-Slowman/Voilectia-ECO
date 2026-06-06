'use client'

import { useState, useEffect, useCallback } from 'react'
import { ScrollText, ChevronLeft, ChevronRight, RefreshCw, Filter } from 'lucide-react'

interface AuditLog {
  id: string; userId: string; userName: string; action: string
  resource: string; resourceId: string | null; detail: string | null
  ip: string | null; createdAt: string
}

const ACTION_META: Record<string, { label: string; color: string; bg: string }> = {
  CREATE:    { label: 'Création',      color: 'var(--adm-accent)',  bg: 'var(--adm-accent-sub)'  },
  UPDATE:    { label: 'Modification',  color: 'var(--adm-blue)',    bg: 'var(--adm-blue-sub)'    },
  DELETE:    { label: 'Suppression',   color: 'var(--adm-red)',     bg: 'var(--adm-red-sub)'     },
  BAN:       { label: 'Bannissement',  color: 'var(--adm-orange)',  bg: 'var(--adm-orange-sub)'  },
  UNBAN:     { label: 'Débannissement',color: 'var(--adm-cyan)',    bg: 'var(--adm-cyan-sub)'    },
  LOGIN:     { label: 'Connexion',     color: 'var(--adm-accent)',  bg: 'var(--adm-accent-xsub)' },
  LOGOUT:    { label: 'Déconnexion',   color: 'var(--adm-text-3)',  bg: 'var(--adm-surface-3)'   },
  PUBLISH:   { label: 'Publication',   color: 'var(--adm-purple)',  bg: 'var(--adm-purple-sub)'  },
  UNPUBLISH: { label: 'Dépublication', color: 'var(--adm-gold)',    bg: 'var(--adm-gold-sub)'    },
  ROLE_CHANGE:{ label: 'Rôle modifié', color: 'var(--adm-purple)',  bg: 'var(--adm-purple-sub)'  },
}

const RESOURCE_LABELS: Record<string, string> = {
  article: '📰 Article', changelog: '📜 Changelog', guide: '📚 Guide',
  event: '🎉 Événement', city: '🏘️ Ville', user: '👤 Membre',
  job: '💼 Métier', staff: '🛡️ Staff', giveaway: '🎁 Giveaway',
  server_config: '⚙️ Config', player_auth: '🔐 Auth joueur',
}

const RESOURCES = Object.keys(RESOURCE_LABELS)

function fmtDateTime(d: string) {
  const dt = new Date(d)
  return dt.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function AdminAuditPage() {
  const [logs,       setLogs]       = useState<AuditLog[]>([])
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const [resource,   setResource]   = useState('')
  const [action,     setAction]     = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (resource) params.set('resource', resource)
    if (action)   params.set('action', action)
    const data = await fetch('/api/audit?' + params).then(r => r.json()).catch(() => ({ logs: [] }))
    setLogs(data.logs ?? [])
    setTotalPages(data.pages ?? 1)
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, resource, action])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [resource, action])

  return (
    <div className="adm-fade-in">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">
            <ScrollText size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--adm-text-3)' }} />
            Journal d&apos;audit
          </h1>
          <p className="adm-page-subtitle">{total} action{total > 1 ? 's' : ''} enregistree{total > 1 ? 's' : ''}</p>
        </div>
        <button onClick={load} className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon">
          <RefreshCw size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={12} style={{ color: 'var(--adm-text-3)' }} />
          <select
            value={resource}
            onChange={e => setResource(e.target.value)}
            className="adm-select adm-input"
            style={{ width: 'auto' }}
          >
            <option value="">Toutes les ressources</option>
            {RESOURCES.map(r => <option key={r} value={r}>{RESOURCE_LABELS[r]}</option>)}
          </select>
        </div>
        <select
          value={action}
          onChange={e => setAction(e.target.value)}
          className="adm-select adm-input"
          style={{ width: 'auto' }}
        >
          <option value="">Toutes les actions</option>
          {Object.entries(ACTION_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="adm-table-wrap" style={{ padding: '40px 24px' }}>
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div className="adm-skeleton" style={{ height: 20, width: 70, borderRadius: 20 }} />
              <div className="adm-skeleton" style={{ height: 13, width: '20%' }} />
              <div className="adm-skeleton" style={{ height: 13, width: '30%' }} />
              <div className="adm-skeleton" style={{ height: 13, flex: 1 }} />
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="adm-table-wrap">
          <div className="adm-empty">
            <div className="adm-empty-icon">📋</div>
            <div className="adm-empty-title">Aucune entree dans le journal</div>
            <div className="adm-empty-desc">Les actions administrateurs apparaitront ici.</div>
          </div>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Ressource</th>
                <th>Detail</th>
                <th className="adm-col-lg">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const meta = ACTION_META[log.action] ?? { label: log.action, color: 'var(--adm-text-2)', bg: 'var(--adm-surface-3)' }
                return (
                  <tr key={log.id}>
                    <td style={{ fontSize: 12, color: 'var(--adm-text-3)', whiteSpace: 'nowrap' }}>
                      {fmtDateTime(log.createdAt)}
                    </td>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{log.userName}</td>
                    <td>
                      <span className="adm-badge" style={{ background: meta.bg, color: meta.color, fontSize: 10 }}>
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--adm-text-2)' }}>
                      {RESOURCE_LABELS[log.resource] ?? log.resource}
                      {log.resourceId && (
                        <span className="adm-code-pill" style={{ marginLeft: 6, fontSize: 9 }}>
                          #{log.resourceId.slice(-6)}
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--adm-text-3)', maxWidth: 280 }}>
                      <span className="adm-truncate" style={{ display: 'block', maxWidth: 280 }}>
                        {log.detail ?? '—'}
                      </span>
                    </td>
                    <td className="adm-col-lg adm-mono" style={{ fontSize: 11, color: 'var(--adm-text-4)' }}>
                      {log.ip ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="adm-pagination">
            <span>{total} entree{total > 1 ? 's' : ''} · Page {page} / {totalPages}</span>
            <div className="adm-pagination-pages">
              <button className="adm-pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={12} />
              </button>
              <button className={'adm-pagination-btn' + (page === 1 ? ' active' : '')} onClick={() => setPage(1)}>1</button>
              {totalPages > 1 && (
                <button className={'adm-pagination-btn' + (page === totalPages ? ' active' : '')} onClick={() => setPage(totalPages)}>
                  {totalPages}
                </button>
              )}
              <button className="adm-pagination-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
