'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Send, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface City { id: string; name: string; accentColor: string | null }

export default function NouveauProjetPage() {
  const params = useParams()
  const [city,    setCity]    = useState<City | null>(null)
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [form,    setForm]    = useState({
    title:       '',
    description: '',
    budget:      '',
    startDate:   '',
    endDate:     '',
    authorName:  '',
  })

  useEffect(() => {
    fetch(`/api/cities/${params.slug}`)
      .then(r => r.json())
      .then(d => setCity(d))
      .catch(() => {})
  }, [params.slug])

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const accent = city?.accentColor ?? '#3A7A52'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Titre et description requis.')
      return
    }
    if (!city) return
    setSending(true)
    try {
      const res = await fetch(`/api/cities/${city.id}/projects`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      toast.error('Erreur lors de l\'envoi.')
    } finally {
      setSending(false)
    }
  }

  if (!city) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#1A3D2B] border-t-transparent rounded-full animate-spin" />
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
          <Link href={`/villes/${params.slug}/projets`}
                className="inline-flex items-center gap-1.5 text-[rgba(242,232,213,0.5)]
                           hover:text-[#F2E8D5] text-xs mb-6 transition-colors">
            <ChevronLeft size={13} /> Projets de {city.name}
          </Link>
          <h1 className="font-display font-black text-3xl text-[#F2E8D5]">Proposer un projet</h1>
          <p className="text-[rgba(242,232,213,0.5)] text-sm mt-1">
            Votre proposition sera soumise au maire de {city.name}.
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 pb-20">
        {sent ? (
          <div className="bg-white border border-[#DBCAA8] rounded-2xl p-10 text-center">
            <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: accent }} />
            <h2 className="font-display font-bold text-xl text-[#1A3D2B] mb-2">
              Projet soumis !
            </h2>
            <p className="text-[#6B8C6A] text-sm mb-6">
              Votre proposition a été envoyée. Le maire l'examinera et vous contactera.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href={`/villes/${params.slug}/projets`}
                    className="btn-secondary text-sm">
                Voir les projets
              </Link>
              <Link href={`/villes/${params.slug}`}
                    className="btn-primary text-sm">
                Retour à la ville
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#DBCAA8] rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Titre du projet *</label>
                <input
                  className="input w-full"
                  value={form.title}
                  onChange={e => f('title', e.target.value)}
                  placeholder="Construction de la grande bibliothèque"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Description *</label>
                <textarea
                  className="input w-full resize-none"
                  rows={5}
                  value={form.description}
                  onChange={e => f('description', e.target.value)}
                  placeholder="Décrivez le projet, ses objectifs et son impact sur la ville…"
                  maxLength={2000}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">
                    Budget estimé (VLC)
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={form.budget}
                    onChange={e => f('budget', e.target.value)}
                    placeholder="50000"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Votre pseudo</label>
                  <input
                    className="input w-full"
                    value={form.authorName}
                    onChange={e => f('authorName', e.target.value)}
                    placeholder="Pseudo Eco"
                    maxLength={24}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Date de début</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={form.startDate}
                    onChange={e => f('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Date de fin prévue</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={form.endDate}
                    onChange={e => f('endDate', e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                           font-semibold text-sm text-white transition-opacity disabled:opacity-50"
                style={{ background: accent }}
              >
                <Send size={15} />
                {sending ? 'Envoi en cours…' : 'Soumettre le projet'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
