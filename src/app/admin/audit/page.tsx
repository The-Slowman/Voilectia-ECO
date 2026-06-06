'use client'

import { useState, useEffect, useCallback } from 'react'
import { ScrollText, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

interface AuditLog {
  id: string; userId: string; userName: string; action: string
  resource: string; resourceId: string | null; detail: string | null
  ip: string | null; createdAt: string
}

const ACTION_COLORS: Record<string, string> = {
  CREATE:    'text-green-400 bg-green-900/20',
  UPDATE:    'text-blue-400 bg-blue-900/20',
  DELETE:    'text-red-400 bg-red-900/20',
  BAN:       'text-orange-400 bg-orange-900/20',
  UNBAN:     'text-emerald-400 bg-emerald-900/20',
  LOGIN:     'text-[#52B788] bg-[rgba(82,183,136,0.1)]',
  LOGOUT:    'text-[#5A8A6A] bg-[rgba(82,183,136,0.05)]',
  PUBLISH:   'text-purple-400 bg-purple-900/20',
  UNPUBLISH: 'text-yellow-400 bg-yellow-900/20',
}

const RESOURCES = [
  '', 'article', 'changelog', 'guide', 'event', 'city', 'user', 'job',
  'staff', 'giveaway', 'server_config', 'job_progression', 'player_auth',
]

export default function AdminAuditPage() {
  const [logs,       setLogs]       = useState<AuditLog[]>([])
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const [resource,   setResource]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (resource) params.set('resource', resource)
    const data = await fetch(`/api/audit?${params}`).then(r => r.json()).catch(() => ({ logs: [] }))
    setLogs(data.logs ?? [])
    setTotalPages(data.pages ?? 1)
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, resource])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [resource])

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#E8F5EE] flex items-center gap-2">
            <ScrollText size={22} className="text-[#52B788]" /> Journal d'administration
          </h1>
          <p className="text-[#9DC4AD] text-sm mt-1">{total} action{total > 1 ? 's' : ''} enregistrée{total > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#5A8A6A]" />
          <select value={resource} onChange={e => setResource(e.target.value)}
                  className="input-dark text-sm py-1.5 pr-8">
            <option value="">Toutes les ressources</option>
            {RESOURCES.slice(1).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="card-dark p-10 text-center text-[#5A8A6A]">Aucune entrée dans le journal.</div>
      ) : (
        <div className="card-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(82,183,136,0.08)]">
                  <th className="text-left px-4 py-3 text-[10px] text-[#5A8A6A] font-semibold uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] text-[#5A8A6A] font-semibold uppercase tracking-wider">Admin</th>
                  <th className="text-left px-4 py-3 text-[10px] text-[#5A8A6A] font-semibold uppercase tracking-wider">Action</th>
                  <th className="text-left px-4 py-3 text-[10px] text-[#5A8A6A] font-semibold uppercase tracking-wider">Ressource</th>
                  <th className="text-left px-4 py-3 text-[10px] text-[#5A8A6A] font-semibold uppercase tracking-wider">Détail</th>
                  <th className="text-left px-4 py-3 text-[10px] text-[#5A8A6A] font-semibold uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(82,183,136,0.04)]">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-[rgba(82,183,136,0.03)] transition-colors">
                    <td className="px-4 py-3 text-[#5A8A6A] text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-[#E8F5EE] font-medium text-xs">{log.userName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] ?? 'text-[#9DC4AD] bg-[rgba(255,255,255,0.05)]'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="text-[#9DC4AD]">{log.resource}</span>
                      {log.resourceId && (
                        <span className="text-[#5A8A6A] font-mono text-[10px] ml-1">#{log.resourceId.slice(-6)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#9DC4AD] max-w-xs truncate">{log.detail ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-[#5A8A6A] font-mono">{log.ip ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg text-[#9DC4AD] hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-[#9DC4AD]">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg text-[#9DC4AD] hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
