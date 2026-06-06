'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  announcementId: string
  accentColor:    string
}

export function CityCommentForm({ announcementId, accentColor }: Props) {
  const [open,    setOpen]    = useState(false)
  const [sending, setSending] = useState(false)
  const [form,    setForm]    = useState({ authorName: '', content: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.authorName.trim() || !form.content.trim()) {
      toast.error('Tous les champs sont requis.')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/city-comments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, announcementId }),
      })
      if (!res.ok) throw new Error()
      toast.success('Commentaire envoyé !')
      setForm({ authorName: '', content: '' })
      setOpen(false)
    } catch {
      toast.error('Erreur lors de l\'envoi.')
    } finally {
      setSending(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-[#9AB09A] hover:underline"
        style={{ color: accentColor }}
      >
        Laisser un commentaire…
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 pt-1">
      <input
        className="input w-full text-sm"
        placeholder="Votre pseudo Eco"
        value={form.authorName}
        onChange={e => setForm(p => ({ ...p, authorName: e.target.value }))}
        maxLength={48}
      />
      <textarea
        className="input w-full text-sm resize-none"
        rows={2}
        placeholder="Votre commentaire…"
        value={form.content}
        onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
        maxLength={600}
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={sending}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                     text-white transition-opacity disabled:opacity-50"
          style={{ background: accentColor }}
        >
          <Send size={12} />
          {sending ? 'Envoi…' : 'Envoyer'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-[#9AB09A] hover:text-[#6B8C6A]"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
