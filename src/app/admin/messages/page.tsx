'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, MailOpen, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminBadge } from '@/components/admin/AdminBadge'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

interface ContactMessage {
  id: string; name: string; email: string; subject: string
  message: string; read: boolean; createdAt: string
}

export default function AdminMessagesPage() {
  const [messages,   setMessages]   = useState<ContactMessage[]>([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState<ContactMessage | null>(null)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const [unreadOnly, setUnreadOnly] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch(`/api/admin/messages?page=${page}&unread=${unreadOnly}`)
    const data = await res.json()
    setMessages(data.messages ?? [])
    setTotalPages(data.pages ?? 1)
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, unreadOnly])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [unreadOnly])

  async function openMessage(m: ContactMessage) {
    setSelected(m)
    if (!m.read) {
      await fetch(`/api/admin/messages/${m.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      setMessages(prev => prev.map(x => x.id === m.id ? { ...x, read: true } : x))
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm('Supprimer ce message ?')) return
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
    toast.success('Message supprimé')
    setSelected(null)
    load()
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Messages de contact</h1>
          <p className="adm-page-subtitle">{total} message{total !== 1 ? 's' : ''}</p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--adm-text-2)', cursor: 'pointer' }}>
          <input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)}
                 style={{ accentColor: 'var(--adm-accent)', width: 14, height: 14 }} />
          Non lus seulement
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Liste */}
        <div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[1, 2, 3, 4].map(i => <div key={i} className="adm-skeleton" style={{ height: 70, borderRadius: 8 }} />)}
            </div>
          ) : messages.length === 0 ? (
            <AdminEmptyState icon="📭" title="Aucun message" desc={unreadOnly ? 'Tous les messages ont été lus.' : undefined} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {messages.map(m => (
                <div key={m.id} onClick={() => openMessage(m)}
                     className="adm-card-hover"
                     style={{
                       padding: '12px 14px', cursor: 'pointer',
                       borderLeft: !m.read ? '2px solid var(--adm-accent)' : undefined,
                       borderColor: selected?.id === m.id ? 'var(--adm-accent)' : undefined,
                     }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ marginTop: 2, color: m.read ? 'var(--adm-text-3)' : 'var(--adm-accent)' }}>
                      {m.read ? <MailOpen size={14} /> : <Mail size={14} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 500, color: 'var(--adm-text-1)', fontSize: 13 }}>{m.name}</span>
                        {!m.read && <AdminBadge variant="green">Nouveau</AdminBadge>}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--adm-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subject}</p>
                      <p style={{ fontSize: 11, color: 'var(--adm-text-3)', marginTop: 2 }}>
                        {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 8 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="adm-btn adm-btn-ghost adm-btn-sm">
                    <ChevronLeft size={13} />
                  </button>
                  <span style={{ fontSize: 12, color: 'var(--adm-text-2)' }}>{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="adm-btn adm-btn-ghost adm-btn-sm">
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Détail */}
        {selected ? (
          <div className="adm-card" style={{ padding: 20, alignSelf: 'start', position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--adm-text-1)', marginBottom: 4 }}>{selected.subject}</div>
                <div style={{ fontSize: 12, color: 'var(--adm-text-2)' }}>
                  De : <strong>{selected.name}</strong> · {selected.email}
                </div>
                <div style={{ fontSize: 11, color: 'var(--adm-text-3)', marginTop: 2 }}>
                  {new Date(selected.createdAt).toLocaleString('fr-FR')}
                </div>
              </div>
              <button onClick={() => deleteMessage(selected.id)} className="adm-btn adm-btn-danger adm-btn-sm">
                <Trash2 size={13} />
              </button>
            </div>

            <div style={{ background: 'var(--adm-surface-2)', border: '1px solid var(--adm-border)', borderRadius: 6, padding: '12px 14px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--adm-text-1)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selected.message}</p>
            </div>

            <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
               className="adm-btn adm-btn-primary"
               style={{ textDecoration: 'none', display: 'inline-flex' }}>
              <Mail size={13} /> Répondre par email
            </a>
          </div>
        ) : (
          <div className="adm-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
            <span style={{ fontSize: 13, color: 'var(--adm-text-3)' }}>Sélectionne un message</span>
          </div>
        )}
      </div>
    </div>
  )
}
