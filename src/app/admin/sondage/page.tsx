'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Eye, EyeOff, Check, X, BarChart3, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

interface Question {
  id: string; text: string; type: string; options: string | null
  required: boolean; order: number
  _count?: { answers: number }
  answers?: Array<{ response: string; sessionToken: string }>
}
interface Survey {
  id: string; title: string; description: string | null; season: string | null
  open: boolean; published: boolean; endDate: string | null; order: number
  _count: { questions: number }
  questions: Question[]
}

const Q_TYPES = [
  { key: 'single',   label: 'Choix unique' },
  { key: 'multiple', label: 'Choix multiple' },
  { key: 'scale',    label: 'Échelle 1-10' },
  { key: 'text',     label: 'Réponse libre' },
]

const EMPTY_SURVEY = { title: '', description: '', season: '', endDate: '', published: false, order: 0 }
const EMPTY_Q      = { text: '', type: 'single', options: [] as string[], required: true, optionInput: '' }

export default function AdminSondagePage() {
  const [surveys,  setSurveys]  = useState<Survey[]>([])
  const [loading,  setLoading]  = useState(true)
  const [creating, setCreating] = useState(false)
  const [form,     setForm]     = useState(EMPTY_SURVEY)
  const [saving,   setSaving]   = useState(false)

  // Edition d'un sondage existant
  const [editId,   setEditId]   = useState<string | null>(null)
  const [qForm,    setQForm]    = useState(EMPTY_Q)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetch('/api/surveys?admin=1').then(r => r.json()).catch(() => [])
    setSurveys(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!form.title.trim()) { toast.error('Titre requis'); return }
    setSaving(true)
    try {
      await fetch('/api/surveys', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...form,
          endDate: form.endDate || null,
          season:  form.season  || null,
        }),
      })
      toast.success('Sondage créé')
      setCreating(false)
      setForm(EMPTY_SURVEY)
      load()
    } catch { toast.error('Erreur') } finally { setSaving(false) }
  }

  async function handlePatch(id: string, data: Record<string, unknown>) {
    await fetch(`/api/surveys/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce sondage et toutes ses réponses ?')) return
    await fetch(`/api/surveys/${id}`, { method: 'DELETE' })
    toast.success('Sondage supprimé')
    load()
  }

  async function handleAddQuestion(surveyId: string) {
    if (!qForm.text.trim()) { toast.error('Question requise'); return }
    const opts = qForm.type === 'single' || qForm.type === 'multiple' ? qForm.options : null
    if ((qForm.type === 'single' || qForm.type === 'multiple') && (!opts || opts.length < 2)) {
      toast.error('Au moins 2 options requises pour ce type')
      return
    }
    await fetch(`/api/surveys/${surveyId}/questions`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        text:     qForm.text,
        type:     qForm.type,
        options:  opts,
        required: qForm.required,
        order:    0,
      }),
    })
    toast.success('Question ajoutée')
    setQForm(EMPTY_Q)
    load()
  }

  async function handleDeleteQuestion(surveyId: string, questionId: string) {
    await fetch(`/api/surveys/${surveyId}/questions`, {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ questionId }),
    })
    load()
  }

  function addOption() {
    if (!qForm.optionInput.trim()) return
    setQForm(p => ({ ...p, options: [...p.options, p.optionInput.trim()], optionInput: '' }))
  }
  function removeOption(i: number) {
    setQForm(p => ({ ...p, options: p.options.filter((_, j) => j !== i) }))
  }

  // Stats réponses
  function getParticipants(survey: Survey): number {
    if (!survey.questions[0]?.answers) return 0
    return new Set(survey.questions[0].answers.map((a: { sessionToken: string }) => a.sessionToken)).size
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A3D2B]">Sondages</h1>
          <p className="text-[#6B8C6A] text-sm">{surveys.length} sondage{surveys.length !== 1 ? 's' : ''}</p>
        </div>
        {!creating && (
          <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> Nouveau sondage
          </button>
        )}
      </div>

      {/* ── Formulaire création ── */}
      {creating && (
        <div className="bg-white border border-[#DBCAA8] rounded-xl p-6 space-y-4">
          <h2 className="font-display font-bold text-[#1A3D2B] text-base">Nouveau sondage</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Titre *</label>
              <input className="input w-full" value={form.title}
                     onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                     placeholder="Que pensez-vous de la prochaine saison ?" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Description</label>
              <textarea className="input w-full resize-none" rows={2} value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Description courte visible sur la page sondage" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Saison / Contexte</label>
              <input className="input w-full" value={form.season}
                     onChange={e => setForm(p => ({ ...p, season: e.target.value }))}
                     placeholder="Saison 3, Bêta 2…" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Date de clôture</label>
              <input type="datetime-local" className="input w-full" value={form.endDate}
                     onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Ordre</label>
              <input type="number" className="input w-full" value={form.order}
                     onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} min={0} />
            </div>
            <div className="flex items-center gap-3 mt-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" className="w-4 h-4 accent-[#1A3D2B]"
                       checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} />
                <span className="font-medium text-[#1A3D2B]">Publier immédiatement</span>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleCreate} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
              <Check size={14} /> {saving ? 'Création…' : 'Créer le sondage'}
            </button>
            <button onClick={() => { setCreating(false); setForm(EMPTY_SURVEY) }}
                    className="btn-secondary flex items-center gap-2 text-sm">
              <X size={14} /> Annuler
            </button>
          </div>
        </div>
      )}

      {/* ── Liste des sondages ── */}
      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-20 bg-[#F2E8D5] rounded-xl animate-pulse" />)}
        </div>
      ) : surveys.length === 0 && !creating ? (
        <div className="bg-white border border-[#DBCAA8] rounded-xl p-10 text-center">
          <p className="text-[#9AB09A]">Aucun sondage créé.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {surveys.map(s => {
            const participants = getParticipants(s)
            const isExpanded   = expanded === s.id
            const isEditing    = editId === s.id

            return (
              <div key={s.id} className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden">

                {/* En-tête */}
                <div className="px-5 py-4 flex items-center gap-4">
                  <GripVertical size={16} className="text-[#DBCAA8] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[#1A3D2B]">{s.title}</span>
                      {s.season && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full
                                         bg-[rgba(58,122,82,0.1)] text-[#2D6A4F]">
                          {s.season}
                        </span>
                      )}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        s.published && s.open ? 'bg-[rgba(58,122,82,0.1)] text-[#2D6A4F]' : 'bg-[#F2E8D5] text-[#9AB09A]'
                      }`}>
                        {s.published ? (s.open ? 'Ouvert' : 'Fermé') : 'Brouillon'}
                      </span>
                    </div>
                    <div className="text-xs text-[#9AB09A] mt-0.5 flex items-center gap-3">
                      <span>{s._count.questions} question{s._count.questions !== 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1">
                        <BarChart3 size={10} /> {participants} participant{participants !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePatch(s.id, { published: !s.published })}
                      className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A] hover:text-[#1A3D2B]"
                      title={s.published ? 'Dépublier' : 'Publier'}
                    >
                      {s.published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => handlePatch(s.id, { open: !s.open })}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        s.open ? 'text-[#2D6A4F] border-[rgba(58,122,82,0.3)] hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                               : 'text-[#9AB09A] border-[#DBCAA8] hover:bg-[rgba(58,122,82,0.06)] hover:text-[#2D6A4F]'
                      }`}
                      title={s.open ? 'Fermer le sondage' : 'Rouvrir'}
                    >
                      {s.open ? 'Fermer' : 'Rouvrir'}
                    </button>
                    <button
                      onClick={() => { setExpanded(isExpanded ? null : s.id); setEditId(s.id) }}
                      className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A]"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button onClick={() => handleDelete(s.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-[#9AB09A] hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Questions + ajout */}
                {isExpanded && (
                  <div className="border-t border-[#DBCAA8]">

                    {/* Liste des questions */}
                    {s.questions.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-[#9AB09A] italic">Aucune question.</p>
                    ) : (
                      <div className="divide-y divide-[#DBCAA8]">
                        {s.questions.map((q, qi) => (
                          <div key={q.id} className="px-5 py-3.5 flex items-start gap-3">
                            <span className="text-xs font-bold text-[#9AB09A] mt-0.5 w-5 flex-shrink-0">
                              {qi + 1}.
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#1A3D2B]">{q.text}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#9AB09A]">
                                <span>{Q_TYPES.find(t => t.key === q.type)?.label}</span>
                                {q.required && <span>· Requis</span>}
                              </div>
                              {q.options && (
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {(JSON.parse(q.options) as string[]).map((o, i) => (
                                    <span key={i} className="text-[10px] bg-[#F2E8D5] border border-[#DBCAA8]
                                                              px-2 py-0.5 rounded-full text-[#6B8C6A]">
                                      {o}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button onClick={() => handleDeleteQuestion(s.id, q.id)}
                                    className="p-1 hover:bg-red-50 rounded text-[#9AB09A] hover:text-red-400 flex-shrink-0">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulaire ajout question */}
                    <div className="px-5 py-4 bg-[#F2E8D5]/50 border-t border-[#DBCAA8] space-y-3">
                      <p className="text-xs font-bold text-[#6B8C6A] uppercase tracking-wide">
                        Ajouter une question
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <input className="input w-full text-sm" value={qForm.text}
                                 onChange={e => setQForm(p => ({ ...p, text: e.target.value }))}
                                 placeholder="Texte de la question…" />
                        </div>
                        <div>
                          <select className="input w-full text-sm" value={qForm.type}
                                  onChange={e => setQForm(p => ({ ...p, type: e.target.value, options: [] }))}>
                            {Q_TYPES.map(t => (
                              <option key={t.key} value={t.key}>{t.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="checkbox" className="w-4 h-4 accent-[#1A3D2B]"
                                   checked={qForm.required}
                                   onChange={e => setQForm(p => ({ ...p, required: e.target.checked }))} />
                            <span className="text-[#1A3D2B]">Requise</span>
                          </label>
                        </div>
                      </div>

                      {/* Options pour single/multiple */}
                      {(qForm.type === 'single' || qForm.type === 'multiple') && (
                        <div>
                          <div className="flex gap-2 mb-2">
                            <input className="input flex-1 text-sm" value={qForm.optionInput}
                                   onChange={e => setQForm(p => ({ ...p, optionInput: e.target.value }))}
                                   onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOption())}
                                   placeholder="Ajouter une option…" />
                            <button onClick={addOption} className="btn-secondary text-sm px-3">
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {qForm.options.map((o, i) => (
                              <span key={i} className="flex items-center gap-1.5 text-xs bg-white
                                                        border border-[#DBCAA8] rounded-full px-2.5 py-1">
                                {o}
                                <button onClick={() => removeOption(i)}
                                        className="text-[#9AB09A] hover:text-red-400">
                                  <X size={10} />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <button onClick={() => handleAddQuestion(s.id)}
                              className="btn-primary flex items-center gap-2 text-sm">
                        <Plus size={14} /> Ajouter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
