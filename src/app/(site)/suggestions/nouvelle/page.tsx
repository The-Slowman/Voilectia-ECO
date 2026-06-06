'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Send, Info, Lightbulb, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface PlayerMe { id: string; username: string; email: string; avatar: string | null }

export default function NouvelleSuggestionPage() {
  const router  = useRouter()
  const [player,  setPlayer]  = useState<PlayerMe | null>(null)
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })

  useEffect(() => {
    fetch('/api/player/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data) {
          router.replace('/connexion?redirect=/suggestions/nouvelle')
        } else {
          setPlayer(data)
        }
        setChecking(false)
      })
      .catch(() => {
        router.replace('/connexion?redirect=/suggestions/nouvelle')
      })
  }, [router])

  const f = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/suggestions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (res.status === 401) {
        toast.error('Session expirée. Reconnectez-vous.')
        router.push('/connexion?redirect=/suggestions/nouvelle')
        return
      }
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      toast.error('Erreur lors de l\'envoi. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center">
      <div className="w-8 h-8 border-[3px] border-[#1A3D2B] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (sent) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center px-4">
      <div className="bg-white border border-[#DBCAA8] rounded-xl p-10 text-center max-w-md w-full"
           style={{ borderTop: '4px solid #3A7A52' }}>
        <div className="text-5xl mb-5">💡</div>
        <h2 className="font-display font-bold text-[#1A3D2B] text-xl mb-3">Suggestion envoyée !</h2>
        <p className="text-[#6B8C6A] text-sm mb-6 leading-relaxed">
          Merci pour votre idée ! Elle sera examinée par l'équipe staff et soumise aux votes de la communauté.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/suggestions" className="btn-primary">Voir les suggestions</Link>
          <button onClick={() => { setSent(false); setForm({ title: '', content: '' }) }}
                  className="btn-ghost">Nouvelle idée</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-[#F2E8D5] min-h-screen">

      <div className="bg-[#1A3D2B] pt-24 pb-10 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px]
                        bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link href="/suggestions"
                className="inline-flex items-center gap-1.5 text-[rgba(242,232,213,0.5)]
                           hover:text-[#F2E8D5] text-xs mb-4 transition-colors">
            <ChevronLeft size={13} /> Retour aux suggestions
          </Link>
          <h1 className="font-display font-bold text-3xl text-[#F2E8D5] flex items-center gap-3">
            <Lightbulb className="text-[#D4A820]" size={28} />
            Nouvelle suggestion
          </h1>
          <p className="text-[rgba(242,232,213,0.5)] text-sm mt-1 italic"
             style={{ fontFamily: 'var(--font-lora)' }}>
            Proposez une idée pour améliorer l'expérience sur Voilectia.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* Bandeau compte connecté */}
        {player && (
          <div className="bg-[#EAF4EC] border border-[rgba(58,122,82,0.3)] rounded-xl p-3.5
                          flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-[#3A7A52] flex items-center justify-center
                            text-white font-bold text-sm flex-shrink-0">
              {player.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-[#4A8A62] font-medium">Connecté en tant que </span>
              <span className="text-sm font-semibold text-[#1A3D2B]">{player.username}</span>
            </div>
            <User size={14} className="text-[#4A8A62] flex-shrink-0" />
          </div>
        )}

        {/* Conseils */}
        <div className="bg-[#FBF0C8] border border-[rgba(212,168,32,0.3)] rounded-xl p-4 flex gap-3 mb-6">
          <Info size={16} className="text-[#D4A820] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[#A07810]">
            <strong>Bonne suggestion = bonne chance !</strong>
            <ul className="mt-1 space-y-0.5 list-disc list-inside text-xs">
              <li>Décrivez le problème que ça résout</li>
              <li>Soyez précis et constructif</li>
              <li>Vérifiez qu'une idée similaire n'existe pas déjà</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white border border-[#DBCAA8] rounded-xl p-5 space-y-4">
            <h2 className="font-display font-semibold text-[#1A3D2B] text-sm">Votre suggestion</h2>

            <div>
              <label className="block text-xs font-medium text-[#6B8C6A] mb-1.5">
                Titre de la suggestion *
              </label>
              <input type="text" required value={form.title}
                     onChange={e => f('title', e.target.value)}
                     placeholder="Ex: Ajouter un marché aux enchères en VLC"
                     className="input" />
              <p className="text-[10px] text-[#9AB09A] mt-1">
                Soyez concis et descriptif — {form.title.length}/100
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B8C6A] mb-1.5">
                Description détaillée *
              </label>
              <textarea required rows={5} value={form.content}
                        onChange={e => f('content', e.target.value)}
                        placeholder="Expliquez votre idée en détail. Pourquoi est-elle utile ? Comment pourrait-elle fonctionner ?"
                        className="input resize-none" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href="/suggestions" className="btn-ghost">Annuler</Link>
            <button type="submit" disabled={loading}
                    className="btn-gold disabled:opacity-60 flex items-center gap-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Send size={16} />}
              Envoyer la suggestion
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
