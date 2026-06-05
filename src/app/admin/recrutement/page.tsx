'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Check, X, Users, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const RichEditor = dynamic(
  () => import('@/components/admin/RichEditor').then(m => m.RichEditor),
  { ssr: false, loading: () => <div className="input min-h-[150px] animate-pulse" /> }
)

interface Post {
  id: string; title: string; subtitle: string | null; description: string
  requirements: string; perks: string; minRank: string | null
  slots: number | null; open: boolean; color: string | null; icon: string | null; order: number
  _count: { applications: number }
}
interface Application {
  id: string; playerName: string; discordTag: string; email: string | null
  age: number | null; experience: string; motivation: string; availability: string | null
  status: string; adminNote: string | null; createdAt: string
  post: { title: string; color: string | null }
}

const EMPTY_POST = {
  title: '', subtitle: '', description: '', icon: '🛡️', color: '#3A7A52',
  minRank: '', slots: '', open: true, order: 0,
  requirements: [] as string[], perks: [] as string[],
}

const APP_STATUS = {
  pending:   { label: 'En attente',  color: 'text-[#A07810] bg-[#FBF0C8]' },
  reviewing: { label: 'En révision', color: 'text-[#1A6A8A] bg-[rgba(74,158,196,0.1)]' },
  accepted:  { label: 'Accepté',     color: 'text-[#2D6A4F] bg-[rgba(58,122,82,0.1)]' },
  rejected:  { label: 'Refusé',      color: 'text-red-600 bg-red-50' },
}

export default function AdminRecrutementPage() {
  const [posts,      setPosts]      = useState<Post[]>([])
  const [apps,       setApps]       = useState<Application[]>([])
  const [tab,        setTab]        = useState<'posts' | 'candidatures'>('posts')
  const [editing,    setEditing]    = useState<string | null>(null)
  const [form,       setForm]       = useState(EMPTY_POST)
  const [content,    setContent]    = useState('')
  const [reqInput,   setReqInput]   = useState('')
  const [perkInput,  setPerkInput]  = useState('')
  const [saving,     setSaving]     = useState(false)
  const [openApp,    setOpenApp]    = useState<string | null>(null)
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    const [p, a] = await Promise.all([
      fetch('/api/recruitment/posts?admin=1').then(r => r.json()).catch(() => []),
      fetch('/api/recruitment/applications').then(r => r.json()).catch(() => []),
    ])
    setPosts(p)
    setApps(a)
  }, [])

  useEffect(() => { load() }, [load])

  function startEdit(post?: Post) {
    if (post) {
      setEditing(post.id)
      setForm({
        title:        post.title,
        subtitle:     post.subtitle ?? '',
        description:  '',
        icon:         post.icon ?? '🛡️',
        color:        post.color ?? '#3A7A52',
        minRank:      post.minRank ?? '',
        slots:        post.slots?.toString() ?? '',
        open:         post.open,
        order:        post.order,
        requirements: JSON.parse(post.requirements) as string[],
        perks:        JSON.parse(post.perks) as string[],
      })
      setContent(post.description)
    } else {
      setEditing('new')
      setForm(EMPTY_POST)
      setContent('')
    }
  }

  function cancelEdit() { setEditing(null); setForm(EMPTY_POST); setContent('') }

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Titre requis'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        description: content,
        slots:       form.slots ? parseInt(String(form.slots)) : null,
        minRank:     form.minRank || null,
        subtitle:    form.subtitle || null,
      }
      if (editing === 'new') {
        await fetch('/api/recruitment/posts', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify(payload),
        })
        toast.success('Poste créé')
      } else {
        await fetch(`/api/recruitment/posts/${editing}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify(payload),
        })
        toast.success('Poste mis à jour')
      }
      cancelEdit()
      load()
    } catch { toast.error('Erreur') } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce poste ?')) return
    await fetch(`/api/recruitment/posts/${id}`, { method: 'DELETE' })
    toast.success('Poste supprimé')
    load()
  }

  async function handleToggleOpen(post: Post) {
    await fetch(`/api/recruitment/posts/${post.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ open: !post.open }),
    })
    load()
  }

  async function handleAppStatus(id: string, status: string) {
    const note = noteInputs[id]
    await fetch('/api/recruitment/applications', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ id, status, adminNote: note }),
    })
    toast.success('Candidature mise à jour')
    load()
  }

  function addReq() {
    if (!reqInput.trim()) return
    setForm(p => ({ ...p, requirements: [...p.requirements, reqInput.trim()] }))
    setReqInput('')
  }
  function removeReq(i: number) {
    setForm(p => ({ ...p, requirements: p.requirements.filter((_, j) => j !== i) }))
  }
  function addPerk() {
    if (!perkInput.trim()) return
    setForm(p => ({ ...p, perks: [...p.perks, perkInput.trim()] }))
    setPerkInput('')
  }
  function removePerk(i: number) {
    setForm(p => ({ ...p, perks: p.perks.filter((_, j) => j !== i) }))
  }

  const pendingCount = apps.filter(a => a.status === 'pending').length

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A3D2B]">Recrutement</h1>
          <p className="text-[#6B8C6A] text-sm">
            {posts.length} poste{posts.length !== 1 ? 's' : ''}
            {pendingCount > 0 && <span className="text-orange-500 font-semibold"> · {pendingCount} candidature{pendingCount !== 1 ? 's' : ''} en attente</span>}
          </p>
        </div>
        {tab === 'posts' && !editing && (
          <button onClick={() => startEdit()} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> Nouveau poste
          </button>
        )}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-[#DBCAA8]">
        {[
          { key: 'posts',        label: `Postes (${posts.length})` },
          { key: 'candidatures', label: `Candidatures (${apps.length})${pendingCount > 0 ? ` · ${pendingCount} 🟠` : ''}` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    tab === t.key
                      ? 'border-[#1A3D2B] text-[#1A3D2B]'
                      : 'border-transparent text-[#6B8C6A] hover:text-[#1A3D2B]'
                  }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ONGLET POSTES ── */}
      {tab === 'posts' && (
        <>
          {/* Formulaire */}
          {editing && (
            <div className="bg-white border border-[#DBCAA8] rounded-xl p-6 space-y-5">
              <h2 className="font-display font-bold text-[#1A3D2B] text-base">
                {editing === 'new' ? 'Nouveau poste' : 'Modifier le poste'}
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Titre *</label>
                  <input className="input w-full" value={form.title}
                         onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                         placeholder="Modérateur" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Sous-titre</label>
                  <input className="input w-full" value={form.subtitle}
                         onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
                         placeholder="2 postes disponibles" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Icône (emoji)</label>
                  <input className="input w-full text-xl" value={form.icon}
                         onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                         placeholder="🛡️" maxLength={4} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Couleur</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={form.color}
                           onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                           className="w-10 h-10 rounded-lg border border-[#DBCAA8] cursor-pointer" />
                    <input className="input flex-1 font-mono text-sm" value={form.color}
                           onChange={e => setForm(p => ({ ...p, color: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Rang minimum</label>
                  <input className="input w-full" value={form.minRank}
                         onChange={e => setForm(p => ({ ...p, minRank: e.target.value }))}
                         placeholder="Ex : Vétéran, 18+" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Places disponibles</label>
                  <input type="number" className="input w-full" value={form.slots}
                         onChange={e => setForm(p => ({ ...p, slots: e.target.value }))}
                         placeholder="Laisser vide = illimité" min={1} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Ordre</label>
                  <input type="number" className="input w-full" value={form.order}
                         onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} min={0} />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-sm mt-5">
                    <input type="checkbox" className="w-4 h-4 accent-[#1A3D2B]"
                           checked={form.open} onChange={e => setForm(p => ({ ...p, open: e.target.checked }))} />
                    <span className="font-medium text-[#1A3D2B]">Poste ouvert</span>
                  </label>
                </div>
              </div>

              {/* Description riche */}
              <div>
                <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Description *</label>
                <RichEditor value={content} onChange={setContent} />
              </div>

              {/* Prérequis */}
              <div>
                <label className="block text-xs font-semibold text-[#6B8C6A] mb-2">Prérequis</label>
                <div className="flex gap-2 mb-2">
                  <input className="input flex-1 text-sm" value={reqInput}
                         onChange={e => setReqInput(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addReq())}
                         placeholder="Ex : Être membre depuis 1 mois" />
                  <button onClick={addReq} className="btn-secondary text-sm px-3">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.requirements.map((r, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs bg-[#F2E8D5]
                                              border border-[#DBCAA8] rounded-full px-3 py-1">
                      {r}
                      <button onClick={() => removeReq(i)} className="text-[#9AB09A] hover:text-red-400">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Avantages */}
              <div>
                <label className="block text-xs font-semibold text-[#6B8C6A] mb-2">Avantages du poste</label>
                <div className="flex gap-2 mb-2">
                  <input className="input flex-1 text-sm" value={perkInput}
                         onChange={e => setPerkInput(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPerk())}
                         placeholder="Ex : Accès aux salons staff Discord" />
                  <button onClick={addPerk} className="btn-secondary text-sm px-3">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.perks.map((p, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs bg-[#FBF0C8]
                                              border border-[rgba(212,168,32,0.3)] rounded-full px-3 py-1">
                      🎁 {p}
                      <button onClick={() => removePerk(i)} className="text-[#9AB09A] hover:text-red-400">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                  <Check size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={cancelEdit} className="btn-secondary flex items-center gap-2 text-sm">
                  <X size={14} /> Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des postes */}
          {posts.length === 0 && !editing ? (
            <div className="bg-white border border-[#DBCAA8] rounded-xl p-10 text-center">
              <p className="text-[#9AB09A]">Aucun poste créé.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(post => (
                <div key={post.id}
                     className="bg-white border border-[#DBCAA8] rounded-xl px-5 py-4 flex items-center gap-4"
                     style={{ borderLeft: `4px solid ${post.color ?? '#3A7A52'}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                       style={{ background: `${post.color ?? '#3A7A52'}15` }}>
                    {post.icon ?? '🛡️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#1A3D2B]">{post.title}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        post.open ? 'bg-[rgba(58,122,82,0.1)] text-[#2D6A4F]' : 'bg-[#F2E8D5] text-[#9AB09A]'
                      }`}>
                        {post.open ? 'Ouvert' : 'Fermé'}
                      </span>
                    </div>
                    <div className="text-xs text-[#9AB09A] flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Users size={10} /> {post._count.applications} candidature{post._count.applications !== 1 ? 's' : ''}
                      </span>
                      {post.slots && <span>{post.slots} place{post.slots > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(post)}
                            className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A] hover:text-[#1A3D2B]">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleToggleOpen(post)}
                            className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A] hover:text-[#1A3D2B]"
                            title={post.open ? 'Fermer' : 'Ouvrir'}>
                      {post.open ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => handleDelete(post.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-[#9AB09A] hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── ONGLET CANDIDATURES ── */}
      {tab === 'candidatures' && (
        <div className="space-y-3">
          {apps.length === 0 ? (
            <div className="bg-white border border-[#DBCAA8] rounded-xl p-10 text-center">
              <p className="text-[#9AB09A]">Aucune candidature reçue.</p>
            </div>
          ) : apps.map(app => {
            const st = APP_STATUS[app.status as keyof typeof APP_STATUS] ?? APP_STATUS.pending
            const isOpen = openApp === app.id

            return (
              <div key={app.id} className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 flex items-center gap-4 cursor-pointer hover:bg-[#F2E8D5]/40"
                     onClick={() => setOpenApp(isOpen ? null : app.id)}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm
                                  bg-[#E8D9BF] text-[#1A3D2B] flex-shrink-0">
                    {app.playerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#1A3D2B]">{app.playerName}</div>
                    <div className="text-xs text-[#9AB09A]">
                      {app.discordTag} · <span style={{ color: app.post.color ?? '#3A7A52' }}>{app.post.title}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${st.color}`}>
                    {st.label}
                  </span>
                  {isOpen ? <ChevronUp size={14} className="text-[#9AB09A]" /> : <ChevronDown size={14} className="text-[#9AB09A]" />}
                </div>

                {isOpen && (
                  <div className="border-t border-[#DBCAA8] p-5 space-y-4 bg-[#F2E8D5]/30">
                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      {app.age && <div><span className="text-[#9AB09A]">Âge : </span>{app.age} ans</div>}
                      {app.email && <div><span className="text-[#9AB09A]">Email : </span>{app.email}</div>}
                      {app.availability && <div><span className="text-[#9AB09A]">Dispo : </span>{app.availability}</div>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#9AB09A] uppercase mb-1">Expérience</p>
                      <p className="text-sm text-[#6B8C6A] whitespace-pre-line">{app.experience}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#9AB09A] uppercase mb-1">Motivation</p>
                      <p className="text-sm text-[#6B8C6A] whitespace-pre-line">{app.motivation}</p>
                    </div>
                    <div className="space-y-2">
                      <textarea
                        className="input w-full resize-none text-sm"
                        rows={2}
                        placeholder="Note interne (optionnelle)…"
                        value={noteInputs[app.id] ?? app.adminNote ?? ''}
                        onChange={e => setNoteInputs(p => ({ ...p, [app.id]: e.target.value }))}
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        {Object.entries(APP_STATUS).map(([key, s]) => (
                          <button key={key}
                                  onClick={() => handleAppStatus(app.id, key)}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all
                                              ${app.status === key ? s.color + ' border-current' : 'text-[#6B8C6A] border-[#DBCAA8] hover:bg-[#F2E8D5]'}`}>
                            {s.label}
                          </button>
                        ))}
                      </div>
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
