'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, MailOpen, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import toast from 'react-hot-toast'

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
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#E8F5EE]">Messages de contact</h1>
          <p className="text-[#9DC4AD] text-sm mt-1">{total} message{total > 1 ? 's' : ''}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#9DC4AD] cursor-pointer">
          <input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)}
                 className="w-4 h-4 accent-[#52B788]" />
          Non lus seulement
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Liste */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="card-dark p-10 text-center text-[#5A8A6A]">Aucun message</div>
          ) : messages.map(m => (
            <div key={m.id}
                 onClick={() => openMessage(m)}
                 className={`card-dark p-4 cursor-pointer hover:border-[rgba(82,183,136,0.3)] transition-colors
                             ${selected?.id === m.id ? 'border-[rgba(82,183,136,0.4)]' : ''}
                             ${!m.read ? 'border-l-2 border-l-[#52B788]' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {m.read
                    ? <MailOpen size={15} className="text-[#5A8A6A]" />
                    : <Mail size={15} className="text-[#52B788]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#E8F5EE] text-sm">{m.name}</span>
                    {!m.read && <span className="w-2 h-2 rounded-full bg-[#52B788]" />}
                  </div>
                  <p className="text-xs text-[#9DC4AD] truncate">{m.subject}</p>
                  <p className="text-[10px] text-[#5A8A6A]">{new Date(m.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
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

        {/* Détail */}
        {selected ? (
          <div className="card-dark p-5 space-y-4 h-fit sticky top-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-[#E8F5EE]">{selected.subject}</h2>
                <p className="text-xs text-[#9DC4AD] mt-0.5">
                  De : <strong>{selected.name}</strong> ({selected.email})
                </p>
                <p className="text-[10px] text-[#5A8A6A]">
                  {new Date(selected.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              <button onClick={() => deleteMessage(selected.id)}
                      className="p-1.5 text-[#5A8A6A] hover:text-red-400 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(82,183,136,0.08)] rounded-xl p-4">
              <p className="text-[#E8F5EE] text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>
            <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
               className="inline-flex items-center gap-2 bg-[#52B788] hover:bg-[#3A7A52] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              <Mail size={14} /> Répondre par email
            </a>
          </div>
        ) : (
          <div className="card-dark p-10 flex items-center justify-center text-[#5A8A6A] text-sm">
            Sélectionne un message
          </div>
        )}
      </div>
    </div>
  )
}
