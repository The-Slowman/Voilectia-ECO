'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Vote, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface VoteData {
  id:          string
  title:       string
  description: string | null
  options:     string[]
  endDate:     string | null
  published:   boolean
  responses:   Array<{ option: string; voterToken: string }>
  city:        { name: string; slug: string; accentColor: string | null }
}

function getVoterToken(): string {
  if (typeof window === 'undefined') return ''
  let token = localStorage.getItem('voilectia_voter')
  if (!token) {
    token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('voilectia_voter', token)
  }
  return token
}

export default function VotePage() {
  const params = useParams()
  const [vote,      setVote]      = useState<VoteData | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [voted,     setVoted]     = useState(false)
  const [myChoice,  setMyChoice]  = useState<string | null>(null)
  const [responses, setResponses] = useState<VoteData['responses']>([])
  const [voting,    setVoting]    = useState(false)

  useEffect(() => {
    fetch(`/api/cities/votes/${params.voteId}`)
      .then(r => r.json())
      .then(d => {
        setVote(d)
        setResponses(d.responses)
        const token = getVoterToken()
        const existing = d.responses.find((r: VoteData['responses'][0]) => r.voterToken === token)
        if (existing) { setVoted(true); setMyChoice(existing.option) }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.voteId])

  const accent  = vote?.city.accentColor ?? '#3A7A52'
  const total   = responses.length
  const expired = vote?.endDate ? new Date(vote.endDate) < new Date() : false

  function countFor(opt: string) {
    return responses.filter(r => r.option === opt).length
  }

  async function handleVote(option: string) {
    if (!vote || voted || expired) return
    const token = getVoterToken()
    setVoting(true)
    try {
      const res = await fetch(`/api/cities/votes/${vote.id}/respond`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ option, voterToken: token }),
      })
      if (res.status === 409) { toast.error('Vous avez déjà voté.'); return }
      if (!res.ok) throw new Error()
      setVoted(true)
      setMyChoice(option)
      setResponses(prev => [...prev, { option, voterToken: token }])
      toast.success('Vote enregistré !')
    } catch {
      toast.error('Erreur lors du vote.')
    } finally {
      setVoting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#1A3D2B] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!vote) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center text-[#6B8C6A]">
      Vote introuvable.
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
          <Link href={`/villes/${vote.city.slug}`}
                className="inline-flex items-center gap-1.5 text-[rgba(242,232,213,0.5)]
                           hover:text-[#F2E8D5] text-xs mb-6 transition-colors">
            <ChevronLeft size={13} /> {vote.city.name}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Vote size={22} style={{ color: accent }} />
            <span className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: accent }}>
              Vote citoyen
            </span>
            {expired && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.1)] text-[rgba(242,232,213,0.6)]">
                Terminé
              </span>
            )}
          </div>
          <h1 className="font-display font-black text-3xl text-[#F2E8D5]">{vote.title}</h1>
          {vote.description && (
            <p className="text-[rgba(242,232,213,0.6)] text-sm mt-2">{vote.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 pb-20">
        <div className="bg-white border border-[#DBCAA8] rounded-2xl overflow-hidden shadow-sm">

          {/* Infos */}
          <div className="px-6 py-4 border-b border-[#DBCAA8] bg-[#F2E8D5]/50 flex items-center justify-between">
            <span className="text-sm text-[#6B8C6A]">
              {total} vote{total !== 1 ? 's' : ''} exprimé{total !== 1 ? 's' : ''}
            </span>
            {vote.endDate && (
              <span className="text-xs text-[#9AB09A]">
                {expired ? 'Terminé le' : 'Jusqu\'au'} {new Date(vote.endDate).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            {vote.options.map((opt) => {
              const count    = countFor(opt)
              const pct      = total > 0 ? Math.round((count / total) * 100) : 0
              const isChosen = myChoice === opt
              const isLeader = total > 0 && count === Math.max(...vote.options.map(o => countFor(o)))

              return (
                <button
                  key={opt}
                  disabled={voted || expired || voting}
                  onClick={() => handleVote(opt)}
                  className="w-full text-left relative overflow-hidden rounded-xl border-2 transition-all
                             disabled:cursor-default hover:shadow-sm"
                  style={{
                    borderColor: isChosen ? accent : isLeader && voted ? `${accent}40` : '#DBCAA8',
                    background:  isChosen ? `${accent}08` : 'white',
                  }}
                >
                  {/* Barre de fond */}
                  {voted && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700"
                      style={{ width: `${pct}%`, background: `${accent}12` }}
                    />
                  )}

                  <div className="relative flex items-center justify-between px-4 py-3.5">
                    <span className="font-medium text-[#1A3D2B] flex items-center gap-2">
                      {isChosen && (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                              style={{ background: accent }}>
                          <Check size={11} />
                        </span>
                      )}
                      {opt}
                    </span>
                    {voted && (
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-bold text-sm" style={{ color: accent }}>{pct}%</div>
                          <div className="text-[10px] text-[#9AB09A]">{count} vote{count !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {!voted && !expired && (
            <div className="px-6 pb-4 text-center text-xs text-[#9AB09A]">
              Cliquez sur une option pour voter. Un seul vote par personne.
            </div>
          )}

          {voted && (
            <div className="px-6 pb-5 text-center">
              <span className="text-sm font-semibold" style={{ color: accent }}>
                ✓ Votre vote a été enregistré
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
