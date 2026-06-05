'use client'

import { useState } from 'react'
import { Flag, X, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const REASONS = [
  { key: 'spam',                label: '🚫 Spam' },
  { key: 'harcelement',         label: '⚠️ Harcèlement' },
  { key: 'hors-sujet',          label: '📌 Hors sujet' },
  { key: 'contenu-inapproprie', label: '🔞 Contenu inapproprié' },
  { key: 'autre',               label: '❓ Autre' },
]

function getReporterToken(): string {
  if (typeof window === 'undefined') return ''
  let t = localStorage.getItem('voilectia_voter')
  if (!t) { t = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('voilectia_voter', t) }
  return t
}

interface Props {
  postId?:    string
  commentId?: string
}

export function ForumReportButton({ postId, commentId }: Props) {
  const [open,    setOpen]    = useState(false)
  const [reason,  setReason]  = useState('')
  const [details, setDetails] = useState('')
  const [sending, setSending] = useState(false)
  const [done,    setDone]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) { toast.error('Choisissez une raison'); return }
    setSending(true)
    try {
      const res = await fetch('/api/forum/reports', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ postId, commentId, reason, details, reporterToken: getReporterToken() }),
      })
      if (res.status === 409) { toast.error('Vous avez déjà signalé cet élément.'); setOpen(false); return }
      if (!res.ok) throw new Error()
      setDone(true)
      toast.success('Signalement envoyé. Merci !')
      setTimeout(() => { setOpen(false); setDone(false); setReason(''); setDetails('') }, 1500)
    } catch {
      toast.error('Erreur lors du signalement.')
    } finally {
      setSending(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-[10px] text-[#9AB09A] hover:text-red-400 transition-colors"
      >
        <Flag size={11} /> Signaler
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-white border border-[#DBCAA8] rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-[#1A3D2B] flex items-center gap-2">
            <Flag size={16} className="text-red-400" /> Signaler
          </h3>
          <button onClick={() => setOpen(false)} className="p-1 hover:bg-[#F2E8D5] rounded-lg text-[#9AB09A]">
            <X size={16} />
          </button>
        </div>

        {done ? (
          <p className="text-center text-[#3A7A52] font-semibold py-4">✅ Signalement envoyé !</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              {REASONS.map(r => (
                <label key={r.key}
                       className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 cursor-pointer
                                   transition-all ${reason === r.key
                                     ? 'border-[#3A7A52] bg-[rgba(58,122,82,0.06)]'
                                     : 'border-[#DBCAA8] hover:border-[#9AB09A]'}`}>
                  <input type="radio" name="reason" value={r.key} checked={reason === r.key}
                         onChange={() => setReason(r.key)} className="accent-[#3A7A52]" />
                  <span className="text-sm text-[#1A3D2B]">{r.label}</span>
                </label>
              ))}
            </div>
            <textarea
              className="input w-full resize-none text-sm"
              rows={2}
              placeholder="Détails optionnels…"
              value={details}
              onChange={e => setDetails(e.target.value)}
              maxLength={500}
            />
            <button type="submit" disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold
                               text-sm text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50">
              <Send size={14} /> {sending ? 'Envoi…' : 'Envoyer le signalement'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
