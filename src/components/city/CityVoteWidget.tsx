'use client'

import { useState, useEffect } from 'react'
import { Vote, Check } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface VoteData {
  id:          string
  title:       string
  description: string | null
  options:     string[]
  endDate:     string | null
  responses:   Array<{ option: string; voterToken: string }>
}

interface Props {
  vote:        VoteData
  accentColor: string
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

export function CityVoteWidget({ vote, accentColor }: Props) {
  const pathname = usePathname()
  const slug = pathname.split('/')[2] ?? ''

  const [voted,     setVoted]     = useState(false)
  const [myChoice,  setMyChoice]  = useState<string | null>(null)
  const [responses, setResponses] = useState(vote.responses)

  useEffect(() => {
    const token = getVoterToken()
    const existing = vote.responses.find(r => r.voterToken === token)
    if (existing) {
      setVoted(true)
      setMyChoice(existing.option)
    }
  }, [vote.responses])

  const total = responses.length
  const expired = vote.endDate ? new Date(vote.endDate) < new Date() : false

  async function handleVote(option: string) {
    if (voted || expired) return
    const token = getVoterToken()
    try {
      const res = await fetch(`/api/cities/votes/${vote.id}/respond`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ option, voterToken: token }),
      })
      if (!res.ok) return
      setVoted(true)
      setMyChoice(option)
      setResponses(prev => [...prev, { option, voterToken: token }])
    } catch { /* silent */ }
  }

  function countFor(opt: string) {
    return responses.filter(r => r.option === opt).length
  }

  return (
    <div className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#DBCAA8] flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide mb-1"
               style={{ color: accentColor }}>
            <Vote size={11} /> Vote citoyen
          </div>
          <p className="font-semibold text-sm text-[#1A3D2B]">{vote.title}</p>
          {vote.description && (
            <p className="text-xs text-[#9AB09A] mt-0.5">{vote.description}</p>
          )}
        </div>
        {expired && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F2E8D5] text-[#9AB09A]
                           flex-shrink-0">
            Terminé
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        {vote.options.map((opt) => {
          const count   = countFor(opt)
          const pct     = total > 0 ? Math.round((count / total) * 100) : 0
          const isChosen = myChoice === opt

          return (
            <button
              key={opt}
              disabled={voted || expired}
              onClick={() => handleVote(opt)}
              className="w-full text-left relative overflow-hidden rounded-lg border transition-all
                         disabled:cursor-default"
              style={{
                borderColor: isChosen ? accentColor : '#DBCAA8',
                background:  isChosen ? `${accentColor}08` : 'white',
              }}
            >
              {/* Barre de progression */}
              {voted && (
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700"
                  style={{ width: `${pct}%`, background: `${accentColor}15` }}
                />
              )}
              <div className="relative flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium text-[#1A3D2B] flex items-center gap-1.5">
                  {isChosen && <Check size={11} style={{ color: accentColor }} />}
                  {opt}
                </span>
                {voted && (
                  <span className="text-xs font-bold" style={{ color: accentColor }}>
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="px-4 pb-3 flex items-center justify-between">
        <span className="text-[10px] text-[#9AB09A]">{total} vote{total !== 1 ? 's' : ''}</span>
        <Link
          href={`/villes/${slug}/vote/${vote.id}`}
          className="text-[10px] font-semibold transition-colors"
          style={{ color: accentColor }}
        >
          Voir les détails →
        </Link>
      </div>
    </div>
  )
}
