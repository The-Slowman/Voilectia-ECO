'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Lightbulb, ThumbsUp, ThumbsDown, Check, X, Zap, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Suggestion {
  id: string; title: string; content: string; authorName: string;
  status: string; upvotes: number; downvotes: number;
  adminNote: string | null; createdAt: string;
}

const STATUSES = [
  { key: 'pending',     label: 'En attente',  color: 'bg-[#F2E8D5] text-[#6B8C6A] border-[#DBCAA8]' },
  { key: 'planned',     label: 'Planifié',    color: 'bg-[#FBF0C8] text-[#A07810] border-[rgba(212,168,32,0.3)]' },
  { key: 'in_progress', label: 'En cours',    color: 'bg-[rgba(74,158,196,0.1)] text-[#1A6A8A] border-[rgba(74,158,196,0.25)]' },
  { key: 'done',        label: 'Réalisé',     color: 'bg-[rgba(58,122,82,0.1)] text-[#2D6A4F] border-[rgba(58,122,82,0.3)]' },
  { key: 'rejected',    label: 'Refusé',      color: 'bg-red-50 text-red-600 border-red-200' },
]

export default function AdminSuggestionsPage() {
  const router   = useRouter()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading,     setLoading]     = useState(true)
  const [editing,     setEditing]     = useState<string | null>(null)
  const [noteInput,   setNoteInput]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetch('/api/suggestions?sort=recent').then(r => r.json()).catch(() => [])
    setSuggestions(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/suggestions/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    })
    toast.success('Statut mis à jour')
    load()
  }

  async function saveNote(id: string) {
    await fetch(`/api/suggestions/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ adminNote: noteInput }),
    })
    toast.success('Note enregistrée')
    setEditing(null)
    load()
  }

  async function deleteSuggestion(id: string) {
    if (!confirm('Supprimer cette suggestion ?')) return
    await fetch(`/api/suggestions/${id}`, { method: 'DELETE' })
    toast.success('Suggestion supprimée')
    load()
  }

  const pending = suggestions.filter(s => s.status === 'pending').length

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#1A3D2B]">Suggestions</h1>
        <p className="text-[#6B8C6A] text-sm">
          {pending > 0 && <span className="text-orange-500 font-semibold">{pending} en attente · </span>}
          {suggestions.length} au total
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-white border border-[#DBCAA8] rounded-xl h-24 animate-pulse" />)}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="bg-white border border-[#DBCAA8] rounded-xl p-10 text-center text-[#9AB09A]">
          <Lightbulb size={32} className="mx-auto mb-3 opacity-40" />
          Aucune suggestion pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map(s => {
            const status = STATUSES.find(st => st.key === s.status) ?? STATUSES[0]
            const score  = s.upvotes - s.downvotes

            return (
              <div key={s.id}
                   className="bg-white border border-[#DBCAA8] rounded-xl p-5"
                   style={{
                     borderLeft: `4px solid ${
                       s.status === 'done'        ? '#3A7A52'
                     : s.status === 'in_progress' ? '#4A9EC4'
                     : s.status === 'planned'     ? '#D4A820'
                     : s.status === 'rejected'    ? '#EF4444'
                     : '#DBCAA8'
                     }`
                   }}>

                {/* Header */}
                <div className="flex items-start gap-4 mb-3">
                  {/* Score */}
                  <div className="text-center flex-shrink-0">
                    <div className={`font-display font-bold text-xl ${
                      score > 0 ? 'text-[#3A7A52]' : score < 0 ? 'text-red-500' : 'text-[#9AB09A]'
                    }`}>
                      {score > 0 ? '+' : ''}{score}
                    </div>
                    <div className="text-[10px] text-[#9AB09A] flex items-center gap-1 justify-center">
                      <ThumbsUp size={9} /> {s.upvotes} · <ThumbsDown size={9} /> {s.downvotes}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1A3D2B] text-sm mb-1">{s.title}</h3>
                    <p className="text-[#6B8C6A] text-xs leading-relaxed line-clamp-2">{s.content}</p>
                    <p className="text-[10px] text-[#9AB09A] mt-1">
                      par {s.authorName} · {new Date(s.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {/* Actions */}
                  <button onClick={() => deleteSuggestion(s.id)}
                          className="p-1.5 rounded-lg text-[#9AB09A] hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Note admin */}
                {editing === s.id ? (
                  <div className="flex gap-2 mb-3">
                    <input
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      placeholder="Note publique visible par les joueurs..."
                      className="input flex-1 text-xs py-1.5"
                      autoFocus
                    />
                    <button onClick={() => saveNote(s.id)}
                            className="p-1.5 rounded-lg bg-[rgba(58,122,82,0.1)] text-[#3A7A52] hover:bg-[rgba(58,122,82,0.2)]">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditing(null)}
                            className="p-1.5 rounded-lg text-[#9AB09A] hover:bg-[#F2E8D5]">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditing(s.id); setNoteInput(s.adminNote ?? '') }}
                    className="flex items-center gap-1.5 text-[10px] text-[#9AB09A] hover:text-[#1A3D2B]
                               mb-3 transition-colors"
                  >
                    <Zap size={10} />
                    {s.adminNote ? `Note : "${s.adminNote}"` : 'Ajouter une note publique'}
                  </button>
                )}

                {/* Changement de statut */}
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map(st => (
                    <button
                      key={st.key}
                      onClick={() => updateStatus(s.id, st.key)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        s.status === st.key
                          ? st.color + ' ring-1 ring-offset-1 ring-current'
                          : 'bg-[#F2E8D5] text-[#9AB09A] border-[#DBCAA8] hover:border-[#1A3D2B] hover:text-[#1A3D2B]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
