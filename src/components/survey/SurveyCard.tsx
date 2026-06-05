'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, BarChart3, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Answer  { response: string; sessionToken: string }
interface Question {
  id: string; text: string; type: string; options: string | null
  required: boolean; order: number; answers: Answer[]
}
interface SurveyData {
  id: string; title: string; description: string | null; season: string | null
  endDate: string | null; open: boolean; questions: Question[]
}

interface Props {
  survey: SurveyData
  closed?: boolean
}

function getSessionToken(): string {
  if (typeof window === 'undefined') return ''
  let token = localStorage.getItem('voilectia_survey_token')
  if (!token) {
    token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('voilectia_survey_token', token)
  }
  return token
}

function ResultBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#6B8C6A] truncate pr-2">{label}</span>
        <span className="font-bold flex-shrink-0" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 bg-[#E8D9BF] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
             style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="text-[10px] text-[#9AB09A]">{count} réponse{count !== 1 ? 's' : ''}</div>
    </div>
  )
}

export function SurveyCard({ survey, closed = false }: Props) {
  const [expanded,  setExpanded]  = useState(!closed)
  const [responses, setResponses] = useState<Record<string, string | string[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [sending,   setSending]   = useState(false)
  const [hasVoted,  setHasVoted]  = useState(false)

  // Vérifier si déjà voté
  useEffect(() => {
    const token = getSessionToken()
    const voted = survey.questions.some(q => q.answers.some(a => a.sessionToken === token))
    setHasVoted(voted)
  }, [survey.questions])

  const showResults = submitted || hasVoted || closed

  // Stats par question
  function getChoiceStats(question: Question) {
    const opts = question.options ? JSON.parse(question.options) as string[] : []
    const total = new Set(question.answers.map(a => a.sessionToken)).size
    return { opts, total }
  }

  function countChoice(question: Question, opt: string) {
    return question.answers.filter(a => {
      try {
        const r = JSON.parse(a.response)
        return Array.isArray(r) ? r.includes(opt) : r === opt
      } catch {
        return a.response === opt
      }
    }).length
  }

  function getScaleAvg(question: Question) {
    const nums = question.answers.map(a => parseInt(a.response)).filter(n => !isNaN(n))
    if (!nums.length) return null
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
  }

  function handleChoice(questionId: string, value: string, multi = false) {
    setResponses(prev => {
      if (!multi) return { ...prev, [questionId]: value }
      const cur = (prev[questionId] as string[] | undefined) ?? []
      const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value]
      return { ...prev, [questionId]: next }
    })
  }

  async function handleSubmit() {
    // Vérifier les questions requises
    for (const q of survey.questions) {
      if (!q.required) continue
      const r = responses[q.id]
      if (!r || (Array.isArray(r) && r.length === 0) || (typeof r === 'string' && !r.trim())) {
        toast.error(`Veuillez répondre à : "${q.text}"`)
        return
      }
    }

    const token = getSessionToken()
    setSending(true)
    try {
      const res = await fetch(`/api/surveys/${survey.id}/answer`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          sessionToken: token,
          answers: survey.questions.map(q => ({
            questionId: q.id,
            response:   responses[q.id] ?? '',
          })),
        }),
      })
      if (res.status === 409) {
        toast.error('Vous avez déjà répondu à ce sondage.')
        setHasVoted(true)
        return
      }
      if (!res.ok) throw new Error()
      setSubmitted(true)
      toast.success('Merci pour votre participation !')
    } catch {
      toast.error('Erreur lors de l\'envoi.')
    } finally {
      setSending(false)
    }
  }

  const accent = '#3A7A52'

  return (
    <div className="bg-white border border-[#DBCAA8] rounded-2xl overflow-hidden shadow-sm">

      {/* En-tête */}
      <div className="p-6 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {survey.season && (
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide
                              px-2.5 py-0.5 rounded-full mb-2 border"
                   style={{ background: `${accent}12`, color: accent, borderColor: `${accent}30` }}>
                📅 {survey.season}
              </div>
            )}
            <h3 className="font-display font-bold text-xl text-[#1A3D2B] mb-1">{survey.title}</h3>
            {survey.description && (
              <p className="text-sm text-[#6B8C6A]">{survey.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-[#9AB09A]">
              <span>{survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''}</span>
              {survey.endDate && !closed && (
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  Jusqu'au {new Date(survey.endDate).toLocaleDateString('fr-FR')}
                </span>
              )}
              {closed && <span className="text-[#9AB09A]">Terminé</span>}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {(submitted || hasVoted) && (
              <CheckCircle2 size={20} style={{ color: accent }} />
            )}
            {expanded ? <ChevronUp size={18} className="text-[#9AB09A]" /> : <ChevronDown size={18} className="text-[#9AB09A]" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#DBCAA8]">

          {/* Questions */}
          <div className="divide-y divide-[#DBCAA8]">
            {survey.questions.map((q, qi) => {
              const opts  = q.options ? JSON.parse(q.options) as string[] : []
              const { total } = getChoiceStats(q)
              const myVal = responses[q.id]

              return (
                <div key={q.id} className="px-6 py-5">
                  <p className="font-semibold text-sm text-[#1A3D2B] mb-3">
                    <span className="text-[#9AB09A] mr-2">{qi + 1}.</span>
                    {q.text}
                    {q.required && !showResults && (
                      <span className="text-red-400 ml-1 text-xs">*</span>
                    )}
                  </p>

                  {/* ── Résultats ── */}
                  {showResults ? (
                    <div className="space-y-3">
                      {q.type === 'text' ? (
                        <div className="space-y-2">
                          {q.answers.slice(0, 5).map((a, i) => (
                            <div key={i} className="text-sm text-[#6B8C6A] bg-[#F2E8D5] rounded-lg px-3 py-2 italic">
                              « {a.response} »
                            </div>
                          ))}
                          {q.answers.length > 5 && (
                            <p className="text-xs text-[#9AB09A]">+{q.answers.length - 5} autres réponses</p>
                          )}
                          {q.answers.length === 0 && (
                            <p className="text-xs text-[#9AB09A] italic">Aucune réponse</p>
                          )}
                        </div>
                      ) : q.type === 'scale' ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <BarChart3 size={16} style={{ color: accent }} />
                            <span className="text-sm font-bold" style={{ color: accent }}>
                              Moyenne : {getScaleAvg(q) ?? '—'} / 10
                            </span>
                            <span className="text-xs text-[#9AB09A]">({total} réponse{total !== 1 ? 's' : ''})</span>
                          </div>
                          <div className="flex gap-1.5 flex-wrap mt-2">
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
                              const cnt = q.answers.filter(a => a.response === String(n)).length
                              const pct = total > 0 ? (cnt / total) * 100 : 0
                              return (
                                <div key={n} className="flex flex-col items-center gap-1">
                                  <div className="w-6 rounded-t-sm transition-all duration-700"
                                       style={{ height: `${Math.max(pct * 1.5, 3)}px`, background: accent, opacity: pct > 0 ? 1 : 0.15 }} />
                                  <span className="text-[9px] text-[#9AB09A]">{n}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {opts.map(opt => (
                            <ResultBar
                              key={opt}
                              label={opt}
                              count={countChoice(q, opt)}
                              total={total}
                              color={accent}
                            />
                          ))}
                          <p className="text-[10px] text-[#9AB09A]">{total} participant{total !== 1 ? 's' : ''}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── Formulaire ── */
                    <div>
                      {q.type === 'single' && (
                        <div className="space-y-2">
                          {opts.map(opt => (
                            <label key={opt}
                                   className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 cursor-pointer
                                               transition-all ${myVal === opt
                                                 ? 'border-[#3A7A52] bg-[rgba(58,122,82,0.06)]'
                                                 : 'border-[#DBCAA8] hover:border-[#9AB09A]'}`}>
                              <input type="radio" name={q.id} value={opt} checked={myVal === opt}
                                     onChange={() => handleChoice(q.id, opt)}
                                     className="w-4 h-4 accent-[#3A7A52]" />
                              <span className="text-sm text-[#1A3D2B]">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {q.type === 'multiple' && (
                        <div className="space-y-2">
                          {opts.map(opt => {
                            const checked = (myVal as string[] | undefined)?.includes(opt) ?? false
                            return (
                              <label key={opt}
                                     className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 cursor-pointer
                                                 transition-all ${checked
                                                   ? 'border-[#3A7A52] bg-[rgba(58,122,82,0.06)]'
                                                   : 'border-[#DBCAA8] hover:border-[#9AB09A]'}`}>
                                <input type="checkbox" checked={checked}
                                       onChange={() => handleChoice(q.id, opt, true)}
                                       className="w-4 h-4 accent-[#3A7A52]" />
                                <span className="text-sm text-[#1A3D2B]">{opt}</span>
                              </label>
                            )
                          })}
                          <p className="text-[10px] text-[#9AB09A] mt-1">Plusieurs réponses possibles</p>
                        </div>
                      )}

                      {q.type === 'text' && (
                        <textarea
                          className="input w-full resize-none text-sm"
                          rows={3}
                          placeholder="Votre réponse…"
                          maxLength={1000}
                          value={(myVal as string) ?? ''}
                          onChange={e => setResponses(p => ({ ...p, [q.id]: e.target.value }))}
                        />
                      )}

                      {q.type === 'scale' && (
                        <div className="space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                              <button key={n}
                                      onClick={() => setResponses(p => ({ ...p, [q.id]: String(n) }))}
                                      className={`w-10 h-10 rounded-xl border-2 text-sm font-bold transition-all ${
                                        myVal === String(n)
                                          ? 'border-[#3A7A52] bg-[#3A7A52] text-white'
                                          : 'border-[#DBCAA8] text-[#6B8C6A] hover:border-[#3A7A52]'
                                      }`}>
                                {n}
                              </button>
                            ))}
                          </div>
                          <div className="flex justify-between text-[10px] text-[#9AB09A] px-1">
                            <span>Pas du tout</span><span>Absolument</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bouton soumettre */}
          {!showResults && !closed && (
            <div className="px-6 py-5 border-t border-[#DBCAA8] bg-[#F2E8D5]/40">
              <button
                onClick={handleSubmit}
                disabled={sending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm
                           text-white transition-opacity disabled:opacity-50"
                style={{ background: accent }}
              >
                {sending ? 'Envoi…' : 'Soumettre mes réponses'}
              </button>
              <p className="text-[10px] text-[#9AB09A] mt-2">Anonyme · une seule participation par personne</p>
            </div>
          )}

          {showResults && !closed && (
            <div className="px-6 py-4 border-t border-[#DBCAA8] bg-[rgba(58,122,82,0.04)]">
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: accent }}>
                <CheckCircle2 size={16} /> Merci pour votre participation !
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
