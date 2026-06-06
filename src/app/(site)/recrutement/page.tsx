'use client'

import { useState, useEffect } from 'react'
import { PageHero } from '@/components/ui/PageHero'
import {
  Shield, Users, Check, ChevronDown, ChevronUp,
  Send, CheckCircle2, Star, Clock, X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Post {
  id: string; title: string; subtitle: string | null; description: string
  requirements: string; perks: string; minRank: string | null
  slots: number | null; open: boolean; color: string | null; icon: string | null
  _count: { applications: number }
}

const FORM_INIT = {
  playerName: '', discordTag: '', email: '', age: '',
  experience: '', motivation: '', availability: '', timezone: '',
}

export default function RecrutementPage() {
  const [posts,       setPosts]       = useState<Post[]>([])
  const [loading,     setLoading]     = useState(true)
  const [activePost,  setActivePost]  = useState<Post | null>(null)
  const [form,        setForm]        = useState(FORM_INIT)
  const [sending,     setSending]     = useState(false)
  const [sent,        setSent]        = useState<string | null>(null) // postId envoyé
  const [expanded,    setExpanded]    = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/recruitment/posts')
      .then(r => r.json())
      .then(d => { setPosts(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activePost) return
    if (!form.playerName || !form.discordTag || !form.experience || !form.motivation) {
      toast.error('Merci de remplir tous les champs obligatoires.')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/recruitment/apply', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ postId: activePost.id, ...form }),
      })
      if (res.status === 409) { toast.error('Vous avez déjà postulé pour ce poste.'); return }
      if (!res.ok) throw new Error()
      setSent(activePost.id)
      setActivePost(null)
      setForm(FORM_INIT)
      toast.success('Candidature envoyée !')
    } catch {
      toast.error('Erreur lors de l\'envoi.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <PageHero
        title="Recrutement"
        subtitle="Rejoignez l'équipe de Voilectia et participez à la gestion et à l'animation du serveur."
        badge="🛡️ Équipe"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {loading ? (
          <div className="space-y-4 py-8">
            {[1,2,3].map(i => <div key={i} className="h-36 bg-white border border-[#DBCAA8] rounded-2xl animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-14 text-center mt-8">
            <Shield size={40} className="text-[#9AB09A] mx-auto mb-4" />
            <h3 className="font-display font-bold text-[#1A3D2B] text-xl mb-2">Aucun poste ouvert</h3>
            <p className="text-[#6B8C6A] text-sm">
              Revenez plus tard ou suivez nos annonces Discord pour être parmi les premiers informés.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pt-8">
            {posts.map((post) => {
              const accent = post.color ?? '#3A7A52'
              const reqs   = JSON.parse(post.requirements) as string[]
              const perks  = JSON.parse(post.perks) as string[]
              const isOpen = expanded === post.id
              const hasSent = sent === post.id

              return (
                <div key={post.id}
                     className="bg-white border border-[#DBCAA8] rounded-2xl overflow-hidden
                                transition-shadow hover:shadow-sm"
                     style={{ borderTop: `4px solid ${accent}` }}>

                  {/* En-tête poste */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl
                                      flex-shrink-0"
                           style={{ background: `${accent}15` }}>
                        {post.icon ?? '🛡️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h2 className="font-display font-bold text-xl text-[#1A3D2B]">{post.title}</h2>
                          {post.open ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5
                                             rounded-full bg-[rgba(58,122,82,0.1)] text-[#2D6A4F] border
                                             border-[rgba(58,122,82,0.25)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3A7A52] animate-pulse" />
                              Ouvert
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full
                                             bg-[#F2E8D5] text-[#9AB09A]">
                              Fermé
                            </span>
                          )}
                        </div>
                        {post.subtitle && (
                          <p className="text-sm text-[#6B8C6A] mb-2">{post.subtitle}</p>
                        )}
                        <div className="flex items-center gap-4 flex-wrap text-xs text-[#9AB09A]">
                          {post.slots && (
                            <span className="flex items-center gap-1">
                              <Users size={11} /> {post.slots} place{post.slots > 1 ? 's' : ''}
                            </span>
                          )}
                          {post.minRank && (
                            <span className="flex items-center gap-1">
                              <Star size={11} /> Rang min. : {post.minRank}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setExpanded(isOpen ? null : post.id)}
                        className="p-2 rounded-xl hover:bg-[#F2E8D5] transition-colors text-[#6B8C6A]"
                      >
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>

                    {/* Description courte */}
                    {!isOpen && (
                      <div className="mt-4 text-sm text-[#6B8C6A] line-clamp-2"
                           dangerouslySetInnerHTML={{ __html: post.description }} />
                    )}
                  </div>

                  {/* Détail expandable */}
                  {isOpen && (
                    <div className="border-t border-[#DBCAA8]">

                      {/* Description complète */}
                      <div className="px-6 py-5">
                        <div className="prose prose-sm max-w-none text-[#6B8C6A] rich-content"
                             dangerouslySetInnerHTML={{ __html: post.description }} />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-0 border-t border-[#DBCAA8]">
                        {/* Prérequis */}
                        {reqs.length > 0 && (
                          <div className="px-6 py-5 border-r border-[#DBCAA8]">
                            <h3 className="font-display font-bold text-[#1A3D2B] text-sm mb-3 flex items-center gap-2">
                              <Check size={14} style={{ color: accent }} /> Prérequis
                            </h3>
                            <ul className="space-y-2">
                              {reqs.map((r, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-[#6B8C6A]">
                                  <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center
                                                   flex-shrink-0 text-white text-[9px] font-bold"
                                        style={{ background: accent }}>✓</span>
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Avantages */}
                        {perks.length > 0 && (
                          <div className="px-6 py-5">
                            <h3 className="font-display font-bold text-[#1A3D2B] text-sm mb-3 flex items-center gap-2">
                              <Star size={14} style={{ color: accent }} /> Avantages
                            </h3>
                            <ul className="space-y-2">
                              {perks.map((p, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-[#6B8C6A]">
                                  <span className="mt-0.5 text-base flex-shrink-0">🎁</span>
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Bouton postuler / confirmation / fermé */}
                      <div className="px-6 py-5 border-t border-[#DBCAA8] bg-[#F2E8D5]/40">
                        {hasSent ? (
                          <div className="flex items-center gap-2 text-[#2D6A4F] font-semibold text-sm">
                            <CheckCircle2 size={18} /> Candidature envoyée !
                          </div>
                        ) : !post.open ? (
                          <p className="text-sm text-[#9AB09A] italic">Ce poste est actuellement fermé.</p>
                        ) : activePost?.id === post.id ? (
                          <p className="text-sm text-[#6B8C6A] italic">
                            Remplissez le formulaire ci-dessous ↓
                          </p>
                        ) : (
                          <button
                            onClick={() => setActivePost(post)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold
                                       text-sm text-white transition-opacity hover:opacity-80"
                            style={{ background: accent }}
                          >
                            <Send size={15} /> Postuler
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Formulaire de candidature ── */}
        {activePost && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl text-[#1A3D2B]">
                Postuler — {activePost.title}
              </h2>
              <button onClick={() => setActivePost(null)}
                      className="p-2 hover:bg-[#F2E8D5] rounded-xl transition-colors text-[#9AB09A]">
                <X size={18} />
              </button>
            </div>

            <div className="bg-white border border-[#DBCAA8] rounded-2xl p-6 shadow-sm"
                 style={{ borderTop: `4px solid ${activePost.color ?? '#3A7A52'}` }}>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">
                      Pseudo Eco *
                    </label>
                    <input className="input w-full" value={form.playerName}
                           onChange={e => f('playerName', e.target.value)}
                           placeholder="Votre pseudo exact" maxLength={24} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">
                      Tag Discord *
                    </label>
                    <input className="input w-full" value={form.discordTag}
                           onChange={e => f('discordTag', e.target.value)}
                           placeholder="pseudo#0000 ou @pseudo" maxLength={40} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">
                      Adresse email
                    </label>
                    <input type="email" className="input w-full" value={form.email}
                           onChange={e => f('email', e.target.value)}
                           placeholder="Pour vous contacter (optionnel)" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">
                      Âge
                    </label>
                    <input type="number" className="input w-full" value={form.age}
                           onChange={e => f('age', e.target.value)}
                           placeholder="Votre âge" min={1} max={99} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">
                    Disponibilités
                  </label>
                  <input className="input w-full" value={form.availability}
                         onChange={e => f('availability', e.target.value)}
                         placeholder="Ex : soirs en semaine, week-ends" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">
                    Expérience sur le serveur *
                  </label>
                  <textarea className="input w-full resize-none" rows={3}
                            value={form.experience}
                            onChange={e => f('experience', e.target.value)}
                            placeholder="Depuis combien de temps jouez-vous ? Quelle est votre expérience ?"
                            maxLength={1000} required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">
                    Lettre de motivation *
                  </label>
                  <textarea className="input w-full resize-none" rows={6}
                            value={form.motivation}
                            onChange={e => f('motivation', e.target.value)}
                            placeholder={`Pourquoi souhaitez-vous devenir ${activePost.title} sur Voilectia ? Quelles qualités apportez-vous ?`}
                            maxLength={3000} required />
                  <div className="text-right text-[10px] text-[#9AB09A] mt-1">
                    {form.motivation.length}/3000
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={sending}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
                                     text-white transition-opacity disabled:opacity-50"
                          style={{ background: activePost.color ?? '#3A7A52' }}>
                    <Send size={15} />
                    {sending ? 'Envoi…' : 'Envoyer ma candidature'}
                  </button>
                  <button type="button" onClick={() => setActivePost(null)}
                          className="btn-secondary text-sm">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bloc info bas de page */}
        <div className="mt-12 bg-[#F2E8D5] border border-[#DBCAA8] rounded-xl p-5 flex items-start gap-4">
          <Clock size={20} className="text-[#D4A820] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-bold text-[#1A3D2B] text-sm mb-1">Délai de réponse</h3>
            <p className="text-xs text-[#6B8C6A]">
              Les candidatures sont examinées sous 5 à 10 jours. Vous serez contacté par Discord
              pour la suite du processus. Merci de votre intérêt pour l'équipe Voilectia !
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
