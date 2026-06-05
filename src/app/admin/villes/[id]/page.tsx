'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save, Plus, Trash2, Check, X, UserCheck, UserX, Pencil, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const RichEditor = dynamic(
  () => import('@/components/admin/RichEditor').then(m => m.RichEditor),
  { ssr: false, loading: () => <div className="input min-h-[150px] animate-pulse" /> }
)

interface City {
  id: string; name: string; slug: string; description: string; mayor: string
  mayorEmail: string | null; population: number | null; biome: string | null
  coverImage: string | null; bannerImage: string | null; coordinates: string | null
  accentColor: string | null; motto: string | null; published: boolean; order: number
}
interface Member {
  id: string; playerName: string; discordTag: string | null; role: string
  status: string; message: string | null; createdAt: string; joinedAt: string | null
}
interface Project {
  id: string; title: string; status: string; progress: number; budget: number | null; createdAt: string
}
interface Announcement {
  id: string; title: string; pinned: boolean; authorName: string; createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  proposed: 'Proposé', approved: 'Approuvé', in_progress: 'En cours',
  completed: 'Terminé', cancelled: 'Annulé',
}

export default function AdminVilleEditPage() {
  const params  = useParams()
  const router  = useRouter()
  const isNew   = params.id === 'nouveau'

  const [tab,           setTab]           = useState<'info' | 'membres' | 'projets' | 'annonces'>('info')
  const [city,          setCity]          = useState<Partial<City>>({
    name: '', slug: '', description: '', mayor: '', accentColor: '#3A7A52', published: false, order: 0,
  })
  const [members,       setMembers]       = useState<Member[]>([])
  const [projects,      setProjects]      = useState<Project[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [saving,        setSaving]        = useState(false)
  const [loading,       setLoading]       = useState(!isNew)

  // Annonce form
  const [annForm,    setAnnForm]    = useState({ title: '', content: '', authorName: '', pinned: false })
  const [annContent, setAnnContent] = useState('')
  const [addingAnn,  setAddingAnn]  = useState(false)

  function slugify(str: string) {
    return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
  }

  const loadExtra = useCallback(async (id: string) => {
    const [m, p, a] = await Promise.all([
      fetch(`/api/cities/${id}/members`).then(r => r.json()).catch(() => []),
      fetch(`/api/cities/${id}/projects`).then(r => r.json()).catch(() => []),
      fetch(`/api/cities/${id}/announcements`).then(r => r.json()).catch(() => []),
    ])
    setMembers(m)
    setProjects(p)
    setAnnouncements(a)
  }, [])

  useEffect(() => {
    if (isNew) { setLoading(false); return }
    fetch(`/api/cities/${params.id}`)
      .then(r => r.json())
      .then(d => {
        setCity(d)
        setLoading(false)
        loadExtra(d.id)
      })
      .catch(() => { toast.error('Ville introuvable'); router.push('/admin/villes') })
  }, [params.id, isNew, router, loadExtra])

  const f = (k: string, v: unknown) => setCity(p => ({ ...p, [k]: v }))

  async function handleSave() {
    if (!city.name?.trim() || !city.mayor?.trim()) {
      toast.error('Nom et maire requis')
      return
    }
    setSaving(true)
    try {
      const payload = { ...city, slug: city.slug || slugify(city.name ?? '') }
      if (isNew) {
        const res = await fetch('/api/cities', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify(payload),
        })
        const created = await res.json()
        toast.success('Ville créée !')
        router.push(`/admin/villes/${created.id}`)
      } else {
        await fetch(`/api/cities/${city.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify(payload),
        })
        toast.success('Sauvegardé')
      }
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function handleMemberAction(memberId: string, status: string) {
    await fetch(`/api/cities/${city.id}/members`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ memberId, status }),
    })
    toast.success(status === 'approved' ? 'Membre approuvé' : 'Demande refusée')
    loadExtra(city.id!)
  }

  async function handleProjectStatus(projectId: string, status: string) {
    await fetch(`/api/cities/${city.id}/projects/${projectId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ status }),
    })
    toast.success('Statut mis à jour')
    loadExtra(city.id!)
  }

  async function handleProjectProgress(projectId: string, progress: number) {
    await fetch(`/api/cities/${city.id}/projects/${projectId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ progress }),
    })
    loadExtra(city.id!)
  }

  async function handleDeleteProject(projectId: string) {
    if (!confirm('Supprimer ce projet ?')) return
    await fetch(`/api/cities/${city.id}/projects/${projectId}`, { method: 'DELETE' })
    toast.success('Projet supprimé')
    loadExtra(city.id!)
  }

  async function handleAddAnnouncement() {
    if (!annForm.title.trim() || !annContent.trim()) { toast.error('Titre et contenu requis'); return }
    await fetch(`/api/cities/${city.id}/announcements`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ ...annForm, content: annContent }),
    })
    toast.success('Annonce publiée')
    setAddingAnn(false)
    setAnnForm({ title: '', content: '', authorName: city.mayor ?? '', pinned: false })
    setAnnContent('')
    loadExtra(city.id!)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-[#1A3D2B] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const TABS = [
    { key: 'info',     label: 'Informations' },
    { key: 'membres',  label: `Membres (${members.length})` },
    { key: 'projets',  label: `Projets (${projects.length})` },
    { key: 'annonces', label: `Annonces (${announcements.length})` },
  ] as const

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/villes" className="p-2 hover:bg-[#F2E8D5] rounded-lg transition-colors text-[#6B8C6A]">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-[#1A3D2B]">
              {isNew ? 'Nouvelle ville' : city.name}
            </h1>
            {!isNew && city.slug && (
              <p className="text-xs text-[#9AB09A]">/villes/{city.slug}</p>
            )}
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
                className="btn-primary flex items-center gap-2 text-sm">
          <Save size={14} />
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {/* Onglets */}
      {!isNew && (
        <div className="flex gap-1 border-b border-[#DBCAA8]">
          {TABS.map(t => (
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
      )}

      {/* ── Onglet Info ── */}
      {(isNew || tab === 'info') && (
        <div className="bg-white border border-[#DBCAA8] rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Nom de la ville *</label>
              <input className="input w-full" value={city.name ?? ''} required
                     onChange={e => { f('name', e.target.value); if (isNew) f('slug', slugify(e.target.value)) }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Slug</label>
              <input className="input w-full font-mono text-sm" value={city.slug ?? ''}
                     onChange={e => f('slug', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Maire *</label>
              <input className="input w-full" value={city.mayor ?? ''}
                     onChange={e => f('mayor', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Email du maire</label>
              <input type="email" className="input w-full" value={city.mayorEmail ?? ''}
                     onChange={e => f('mayorEmail', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Biome</label>
              <input className="input w-full" value={city.biome ?? ''}
                     onChange={e => f('biome', e.target.value)} placeholder="Forêt, Désert, Montagne…" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Devise (motto)</label>
              <input className="input w-full" value={city.motto ?? ''}
                     onChange={e => f('motto', e.target.value)} placeholder="La devise de la ville" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Population</label>
              <input type="number" className="input w-full" value={city.population ?? ''}
                     onChange={e => f('population', parseInt(e.target.value) || null)} min={0} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Coordonnées</label>
              <input className="input w-full font-mono text-sm" value={city.coordinates ?? ''}
                     onChange={e => f('coordinates', e.target.value)} placeholder="x,y,z" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Couleur d'accent</label>
              <div className="flex items-center gap-3">
                <input type="color" value={city.accentColor ?? '#3A7A52'}
                       onChange={e => f('accentColor', e.target.value)}
                       className="w-10 h-10 rounded-lg border border-[#DBCAA8] cursor-pointer" />
                <input className="input flex-1 font-mono text-sm" value={city.accentColor ?? ''}
                       onChange={e => f('accentColor', e.target.value)} placeholder="#3A7A52" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Ordre</label>
              <input type="number" className="input w-full" value={city.order ?? 0}
                     onChange={e => f('order', parseInt(e.target.value) || 0)} min={0} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Image de couverture (URL)</label>
              <input className="input w-full" value={city.coverImage ?? ''}
                     onChange={e => f('coverImage', e.target.value)} placeholder="https://…" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Bannière (URL)</label>
              <input className="input w-full" value={city.bannerImage ?? ''}
                     onChange={e => f('bannerImage', e.target.value)} placeholder="https://…" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Description *</label>
              <textarea className="input w-full resize-none" rows={4} value={city.description ?? ''}
                        onChange={e => f('description', e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-[#1A3D2B]"
                   checked={!!city.published} onChange={e => f('published', e.target.checked)} />
            <span className="text-sm font-medium text-[#1A3D2B]">Ville publiée (visible sur le site)</span>
          </label>
        </div>
      )}

      {/* ── Onglet Membres ── */}
      {tab === 'membres' && (
        <div className="space-y-4">
          {/* En attente */}
          {members.filter(m => m.status === 'pending').length > 0 && (
            <div>
              <h3 className="font-display font-semibold text-[#1A3D2B] text-base mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                Demandes en attente
              </h3>
              <div className="space-y-3">
                {members.filter(m => m.status === 'pending').map(m => (
                  <div key={m.id} className="bg-white border border-[#DBCAA8] rounded-xl p-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#1A3D2B]">{m.playerName}</div>
                      {m.discordTag && <div className="text-xs text-[#9AB09A]">Discord : {m.discordTag}</div>}
                      {m.message && <p className="text-xs text-[#6B8C6A] mt-1 line-clamp-2">{m.message}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleMemberAction(m.id, 'approved')}
                              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg
                                         bg-[rgba(58,122,82,0.1)] text-[#2D6A4F] hover:bg-[rgba(58,122,82,0.2)]">
                        <UserCheck size={12} /> Accepter
                      </button>
                      <button onClick={() => handleMemberAction(m.id, 'rejected')}
                              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg
                                         bg-red-50 text-red-500 hover:bg-red-100">
                        <UserX size={12} /> Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Membres approuvés */}
          <div>
            <h3 className="font-display font-semibold text-[#1A3D2B] text-base mb-3">
              Citoyens ({members.filter(m => m.status === 'approved').length})
            </h3>
            <div className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden">
              {members.filter(m => m.status === 'approved').length === 0 ? (
                <p className="text-center py-6 text-[#9AB09A] text-sm">Aucun citoyen approuvé.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#DBCAA8] bg-[#F2E8D5]">
                      <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase">Pseudo</th>
                      <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase hidden md:table-cell">Discord</th>
                      <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase">Rôle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.filter(m => m.status === 'approved').map(m => (
                      <tr key={m.id} className="border-b border-[#DBCAA8]">
                        <td className="px-5 py-3 font-medium text-[#1A3D2B]">{m.playerName}</td>
                        <td className="px-5 py-3 text-[#9AB09A] hidden md:table-cell">{m.discordTag ?? '—'}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.role === 'deputy'
                              ? 'bg-[#FBF0C8] text-[#A07810]'
                              : 'bg-[rgba(58,122,82,0.1)] text-[#2D6A4F]'
                          }`}>
                            {m.role === 'deputy' ? 'Adjoint' : 'Citoyen'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Onglet Projets ── */}
      {tab === 'projets' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-semibold text-[#1A3D2B] text-base">Projets</h3>
            <Link href={`/villes/${city.slug}/projets/nouveau`} target="_blank"
                  className="text-xs text-[#3A7A52] hover:underline flex items-center gap-1">
              <Plus size={11} /> Voir formulaire public
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="bg-white border border-[#DBCAA8] rounded-xl p-8 text-center text-[#9AB09A]">
              Aucun projet proposé pour le moment.
            </div>
          ) : (
            <div className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DBCAA8] bg-[#F2E8D5]">
                    <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase">Projet</th>
                    <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase hidden md:table-cell">Statut</th>
                    <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase hidden lg:table-cell">Avancement</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id} className="border-b border-[#DBCAA8] hover:bg-[#F2E8D5]/40">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-[#1A3D2B] text-sm">{p.title}</div>
                        {p.budget && (
                          <div className="text-[10px] text-[#9AB09A]">{p.budget.toLocaleString('fr-FR')} VLC</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <select
                          value={p.status}
                          onChange={e => handleProjectStatus(p.id, e.target.value)}
                          className="input py-1 text-xs"
                        >
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <input type="range" min={0} max={100} value={p.progress}
                                 onChange={e => handleProjectProgress(p.id, parseInt(e.target.value))}
                                 className="w-24 accent-[#3A7A52]" />
                          <span className="text-xs text-[#6B8C6A] w-8">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => handleDeleteProject(p.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-[#9AB09A] hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Onglet Annonces ── */}
      {tab === 'annonces' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-[#1A3D2B] text-base">Annonces</h3>
            <button onClick={() => setAddingAnn(true)}
                    className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={14} /> Nouvelle annonce
            </button>
          </div>

          {addingAnn && (
            <div className="bg-white border border-[#DBCAA8] rounded-xl p-5 space-y-4">
              <h4 className="font-semibold text-[#1A3D2B] text-sm">Nouvelle annonce</h4>
              <input className="input w-full" placeholder="Titre de l'annonce"
                     value={annForm.title} onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))} />
              <input className="input w-full" placeholder="Nom de l'auteur"
                     value={annForm.authorName || city.mayor || ''}
                     onChange={e => setAnnForm(p => ({ ...p, authorName: e.target.value }))} />
              <RichEditor value={annContent} onChange={setAnnContent} />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" className="w-4 h-4 accent-[#1A3D2B]"
                         checked={annForm.pinned} onChange={e => setAnnForm(p => ({ ...p, pinned: e.target.checked }))} />
                  Épingler
                </label>
                <button onClick={handleAddAnnouncement} className="btn-primary text-sm flex items-center gap-1.5">
                  <Check size={13} /> Publier
                </button>
                <button onClick={() => setAddingAnn(false)} className="btn-secondary text-sm">
                  <X size={13} /> Annuler
                </button>
              </div>
            </div>
          )}

          {announcements.length === 0 ? (
            <div className="bg-white border border-[#DBCAA8] rounded-xl p-8 text-center text-[#9AB09A]">
              Aucune annonce.
            </div>
          ) : (
            <div className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DBCAA8] bg-[#F2E8D5]">
                    <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase">Titre</th>
                    <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase hidden md:table-cell">Auteur</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {announcements.map(a => (
                    <tr key={a.id} className="border-b border-[#DBCAA8] hover:bg-[#F2E8D5]/40">
                      <td className="px-5 py-3.5 font-medium text-[#1A3D2B]">
                        {a.pinned && <span className="mr-1.5">📌</span>}
                        {a.title}
                      </td>
                      <td className="px-5 py-3.5 text-[#9AB09A] hidden md:table-cell">{a.authorName}</td>
                      <td className="px-5 py-3.5 text-right text-[10px] text-[#9AB09A]">
                        {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
