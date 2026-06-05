'use client'

import { useState, useEffect } from 'react'

const EMOJIS = ['👍', '❤️', '😂', '🔥', '👎']

function getVoterToken(): string {
  if (typeof window === 'undefined') return ''
  let t = localStorage.getItem('voilectia_voter')
  if (!t) {
    t = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('voilectia_voter', t)
  }
  return t
}

interface Props {
  postId?:    string
  commentId?: string
  accentColor?: string
}

export function ForumReactions({ postId, commentId, accentColor = '#3A7A52' }: Props) {
  const [counts,  setCounts]  = useState<Record<string, number>>({})
  const [myPicks, setMyPicks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const param = postId ? `postId=${postId}` : `commentId=${commentId}`

  useEffect(() => {
    fetch(`/api/forum/reactions?${param}`)
      .then(r => r.json())
      .then(d => {
        setCounts(d.counts ?? {})
        // Vérifier quelles réactions l'utilisateur a déjà posées
        const token = getVoterToken()
        // On ne peut pas savoir sans un endpoint dédié, on garde vide pour l'instant
      })
      .catch(() => {})
  }, [param])

  async function toggle(emoji: string) {
    if (loading) return
    const token = getVoterToken()
    setLoading(true)

    // Optimistic update
    const had = myPicks.has(emoji)
    setMyPicks(prev => {
      const next = new Set(prev)
      had ? next.delete(emoji) : next.add(emoji)
      return next
    })
    setCounts(prev => ({
      ...prev,
      [emoji]: Math.max(0, (prev[emoji] ?? 0) + (had ? -1 : 1)),
    }))

    try {
      await fetch('/api/forum/reactions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ postId, commentId, emoji, voterToken: token }),
      })
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {EMOJIS.map(emoji => {
        const count = counts[emoji] ?? 0
        const mine  = myPicks.has(emoji)
        return (
          <button
            key={emoji}
            onClick={() => toggle(emoji)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all
                        ${mine
                          ? 'border-current font-bold'
                          : 'border-[#DBCAA8] text-[#6B8C6A] hover:border-[#9AB09A] bg-white'
                        }`}
            style={mine ? {
              background:  `${accentColor}12`,
              color:       accentColor,
              borderColor: `${accentColor}40`,
            } : {}}
          >
            <span>{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        )
      })}
      {total > 0 && (
        <span className="text-[10px] text-[#9AB09A] ml-1">{total} réaction{total > 1 ? 's' : ''}</span>
      )}
    </div>
  )
}
