'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, UserPlus, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface City { id: string; name: string; accentColor: string | null; mayor: string }

export default function RejoindreVillePage() {
  const params = useParams()
  const router = useRouter()
  const [city,    setCity]    = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [form,    setForm]    = useState({
    playerName:  '',
    playerEmail: '',
    discordTag:  '',
    message:     '',
  })

  useEffect(() => {
    fetch(`/api/cities/${params.slug}`)
      .then(r => r.json())
      .then(d => { setCity(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.slug])

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const accent = city?.accentColor ?? '#3A7A52'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.playerName.trim()) { toast.error('Pseudo requis'); return }
    if (!city) return
    setSending(true)
    try {
      const res = await fetch(`/api/cities/${city.id}/members`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (res.status === 409) {
        toast.error('Une demande existe déjà pour ce pseudo.')
        return
      }
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      toast.error('Erreur lors de l\'envoi.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#1A3D2B] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!city) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center text-[#6B8C6A]">
      Ville introuvable.
    </div>
  )

  return (
    <div className="bg-[#F2E8D5] min-h-screen">
      <div className="bg-[#1A3D2B] pt-24 pb-12 relative">
        <div className="absolute inset-0"
             style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}25, transparent 60%)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-[3px]"
             style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        <div className="relative max-w-xl mx-auto px-4 sm:px-6">
          <Link href={`/villes/${params.slug}`}
                className="inline-flex items-center gap-1.5 text-[rgba(242,232,213,0.5)]
                           hover:text-[#F2E8D5] text-xs mb-6 transition-colors">
            <ChevronLeft size={13} /> Retour à {city.name}
          </Link>
          <h1 className="font-display font-black text-3xl text-[#F2E8D5] mb-1">
            Rejoindre {city.name}
          </h1>
          <p className="text-[rgba(242,232,213,0.5)] text-sm">
            Maire : <span className="text-[rgba(242,232,213,0.8)]">{city.mayor}</span>
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 pb-20">
        {sent ? (
          <div className="bg-white border border-[#DBCAA8] rounded-2xl p-10 text-center">
            <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: accent }} />
            <h2 className="font-display font-bold text-xl text-[#1A3D2B] mb-2">
              Candidature envoyée !
            </h2>
            <p className="text-[#6B8C6A] text-sm mb-6">
              Le maire de {city.name} examinera votre demande. Vous serez notifié par Discord ou email.
            </p>
            <Link href={`/villes/${params.slug}`}
                  className="btn-primary inline-flex">
              Retour à la ville
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[#DBCAA8] rounded-2xl p-6 shadow-sm">
            <h2 className="font-display font-bold text-[#1A3D2B] text-base mb-5 flex items-center gap-2">
              <UserPlus size={18} style={{ color: accent }} />
              Demande de citoyenneté
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">
                  Pseudo Eco *
                </label>
                <input
                  className="input w-full"
                  value={form.playerName}
                  onChange={e => f('playerName', e.target.value)}
                  placeholder="Votre pseudo exact sur le serveur"
                  maxLength={24}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">
                  Tag Discord
                </label>
                <input
                  className="input w-full"
                  value={form.discordTag}
                  onChange={e => f('discordTag', e.target.value)}
                  placeholder="pseudo#0000 ou @pseudo"
                  maxLength={40}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  className="input w-full"
                  value={form.playerEmail}
                  onChange={e => f('playerEmail', e.target.value)}
                  placeholder="Pour les notifications (optionnel)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">
                  Message de candidature
                </label>
                <textarea
                  className="input w-full resize-none"
                  rows={4}
                  value={form.message}
                  onChange={e => f('message', e.target.value)}
                  placeholder="Pourquoi souhaitez-vous rejoindre cette ville ? Quelles sont vos compétences ?"
                  maxLength={800}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white
                           transition-opacity disabled:opacity-50"
                style={{ background: accent }}
              >
                {sending ? 'Envoi en cours…' : 'Envoyer ma candidature'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
