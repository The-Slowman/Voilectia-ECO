'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'
import { ThumbsUp, ThumbsDown, Plus, Lightbulb, Clock, CheckCircle, XCircle, Loader, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface Suggestion {
  id: string; title: string; content: string; authorName: string;
  status: string; upvotes: number; downvotes: number;
  adminNote: string | null; createdAt: string;
}

// Token anonyme stocké en localStorage
function getVoterToken(): string {
  if (typeof window === 'undefined') return ''
  let token = localStorage.getItem('vlc_voter_token')
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem('vlc_voter_token', token)
  }
  return token
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  pending:     { label: 'En attente',   icon: <Clock size={11} />,       bg: 'bg-[#F2E8D5]',    text: 'text-[#6B8C6A]', border: 'border-[#DBCAA8]' },
  planned:     { label: 'Planifié',     icon: <Lightbulb size={11} />,   bg: 'bg-[#FBF0C8]',    text: 'text-[#A07810]', border: 'border-[rgba(212,168,32,0.3)]' },
  in_progress: { label: 'En cours',     icon: <Loader size={11} />,      bg: 'bg-[rgba(74,158,196,0.1)]', text: 'text-[#1A6A8A]', border: 'border-[rgba(74,158,196,0.25)]' },
  done:        { label: 'Réalisé',      icon: <CheckCircle size={11} />, bg: 'bg-[rgba(58,122,82,0.1)]', text: 'text-[#2D6A4F]', border: 'border-[rgba(58,122,82,0.3)]' },
  rejected:    { label: 'Refusé',       icon: <XCircle size={11} />,     bg: 'bg-red-50',        text: 'text-red-600',   border: 'border-red-200' },
}

const FILTER_OPTIONS = [
  { key: 'all',        label: 'Toutes' },
  { key: 'pending',    label: 'En attente' },
  { key: 'planned',    label: 'Planifiées' },
  { key: 'in_progress',label: 'En cours' },
  { key: 'done',       label: 'Réalisées' },
]

const SORT_OPTIONS = [
  { key: 'votes',   label: 'Plus votées' },
  { key: 'recent',  label: 'Plus récentes' },
]

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState('all')
  const [sort,        setSort]        = useState('votes')
  const [votes,       setVotes]       = useState<Record<string, 'up' | 'down' | null>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/suggestions?status=${filter}&sort=${sort}`)
      const data = await res.json()
      setSuggestions(data)

      // Récupérer les votes de cet utilisateur
      const token = getVoterToken()
      const myVotes = await fetch(`/api/suggestions/my-votes?token=${token}`).then(r => r.json()).catch(() => ({}))
      setVotes(myVotes)
    } catch {
      toast.error('Erreur lors du chargement.')
    } finally {
      setLoading(false)
    }
  }, [filter, sort])

  useEffect(() => { load() }, [load])

  async function handleVote(id: string, vote: 'up' | 'down') {
    const token = getVoterToken()
    const current = votes[id]

    // Toggle — même vote = annuler
    const newVote = current === vote ? null : vote

    // Optimiste
    setSuggestions(prev => prev.map(s => {
      if (s.id !== id) return s
      const upDelta   = (vote === 'up'   ? (current === 'up'   ? -1 : 1) : (current === 'up'   ? -1 : 0))
      const downDelta = (vote === 'down' ? (current === 'down' ? -1 : 1) : (current === 'down' ? -1 : 0))
      return { ...s, upvotes: s.upvotes + upDelta, downvotes: s.downvotes + downDelta }
    }))
    setVotes(prev => ({ ...prev, [id]: newVote }))

    try {
      await fetch(`/api/suggestions/${id}/vote`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ vote: newVote, token }),
      })
    } catch {
      load() // recharger en cas d'erreur
      toast.error('Erreur lors du vote.')
    }
  }

  return (
    <div>
      <PageHero
        title="Suggestions"
        subtitle="Proposez des idées pour améliorer le serveur et votez pour celles qui vous tiennent à cœur."
        badge="💡 Boîte à idées"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Actions + filtres */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between py-8">
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map(opt => (
              <button key={opt.key} onClick={() => setFilter(opt.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        filter === opt.key
                          ? 'bg-[#1A3D2B] text-[#F2E8D5]'
                          : 'bg-white border border-[#DBCAA8] text-[#6B8C6A] hover:border-[#D4A820]'
                      }`}>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <select value={sort} onChange={e => setSort(e.target.value)}
                    className="input text-xs py-1.5 w-auto">
              {SORT_OPTIONS.map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
            <Link href="/suggestions/nouvelle" className="btn-gold flex items-center gap-2 text-sm whitespace-nowrap">
              <Plus size={15} /> Suggérer
            </Link>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white border border-[#DBCAA8] rounded-xl p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="bg-white border border-[#DBCAA8] rounded-xl p-10 text-center">
            <Lightbulb size={32} className="text-[#9AB09A] mx-auto mb-3" />
            <p className="text-[#6B8C6A] mb-4">Aucune suggestion dans cette catégorie.</p>
            <Link href="/suggestions/nouvelle" className="btn-gold inline-flex">
              <Plus size={15} /> Être le premier à suggérer
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => {
              const status = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.pending
              const myVote = votes[s.id]
              const score = s.upvotes - s.downvotes

              return (
                <div key={s.id}
                     className="bg-white border border-[#DBCAA8] rounded-xl p-5 flex gap-4
                                hover:border-[rgba(212,168,32,0.4)] transition-all"
                     style={{ borderLeft: s.status === 'done' ? '4px solid #3A7A52'
                                        : s.status === 'in_progress' ? '4px solid #4A9EC4'
                                        : s.status === 'planned' ? '4px solid #D4A820'
                                        : s.status === 'rejected' ? '4px solid #EF4444'
                                        : '4px solid #DBCAA8' }}>

                  {/* Votes */}
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleVote(s.id, 'up')}
                      className={`p-2 rounded-lg transition-all ${
                        myVote === 'up'
                          ? 'bg-[rgba(58,122,82,0.15)] text-[#3A7A52]'
                          : 'text-[#9AB09A] hover:bg-[#F2E8D5] hover:text-[#3A7A52]'
                      }`}
                    >
                      <ThumbsUp size={15} />
                    </button>
                    <span className={`font-display font-bold text-base ${
                      score > 0 ? 'text-[#3A7A52]' : score < 0 ? 'text-red-500' : 'text-[#9AB09A]'
                    }`}>
                      {score > 0 ? '+' : ''}{score}
                    </span>
                    <button
                      onClick={() => handleVote(s.id, 'down')}
                      className={`p-2 rounded-lg transition-all ${
                        myVote === 'down'
                          ? 'bg-red-50 text-red-500'
                          : 'text-[#9AB09A] hover:bg-red-50 hover:text-red-400'
                      }`}
                    >
                      <ThumbsDown size={15} />
                    </button>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                        text-[10px] font-bold border ${status.bg} ${status.text} ${status.border}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[#1A3D2B] text-sm mb-1 leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-[#6B8C6A] text-xs leading-relaxed line-clamp-2 mb-2">
                      {s.content}
                    </p>
                    {s.adminNote && (
                      <div className="flex items-start gap-2 bg-[#F2E8D5] border border-[#DBCAA8]
                                      rounded-lg px-3 py-2 mt-2">
                        <Zap size={12} className="text-[#D4A820] flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-[#6B8C6A] italic">{s.adminNote}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-[#9AB09A]">
                      <span>par {s.authorName}</span>
                      <span>·</span>
                      <span>{new Date(s.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span>·</span>
                      <span className="text-[#52B878]">
                        {s.upvotes} 👍 · {s.downvotes} 👎
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Note */}
        <div className="mt-8 bg-[#F2E8D5] border border-[#DBCAA8] rounded-xl p-4 text-xs text-[#6B8C6A]">
          <strong className="text-[#1A3D2B]">Comment ça marche ?</strong> Soumettez vos idées,
          la communauté vote, et l'équipe staff traite les suggestions selon leur popularité et faisabilité.
          Le statut est mis à jour régulièrement.
        </div>
      </div>
    </div>
  )
}
