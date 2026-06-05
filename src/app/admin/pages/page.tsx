'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, Check, X, Link2 } from 'lucide-react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const RichEditor = dynamic(
  () => import('@/components/admin/RichEditor').then(m => m.RichEditor),
  { ssr: false, loading: () => <div className="input min-h-[200px] animate-pulse" /> }
)

interface CustomPage {
  id: string; title: string; slug: string; published: boolean
  showInNav: boolean; navSection: string; icon: string | null; order: number
  createdAt: string
}
interface NavItem {
  id: string; label: string; href: string; icon: string | null
  external: boolean; section: string; order: number; active: boolean
}

const SECTIONS = [
  { key: 'server',      label: 'Serveur' },
  { key: 'communaute',  label: 'Communauté' },
  { key: 'top',         label: 'Barre supérieure' },
]

const PAGE_INIT = { title: '', slug: '', icon: '', published: false, showInNav: true, navSection: 'communaute', order: 99 }
const NAV_INIT  = { label: '', href: '', icon: '', external: false, section: 'communaute', order: 99, active: true }

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export default function AdminPagesPage() {
  const [pages,     setPages]     = useState<CustomPage[]>([])
  const [navItems,  setNavItems]  = useState<NavItem[]>([])
  const [tab,       setTab]       = useState<'pages' | 'nav'>('pages')
  const [editingP,  setEditingP]  = useState<string | null>(null)
  const [editingN,  setEditingN]  = useState<string | null>(null)
  const [formP,     setFormP]     = useState(PAGE_INIT)
  const [formN,     setFormN]     = useState(NAV_INIT)
  const [content,   setContent]   = useState('')
  const [saving,    setSaving]    = useState(false)

  const load = useCallback(async () => {
    const data = await fetch('/api/pages?admin=1').then(r => r.json()).catch(() => ({ pages: [], navItems: [] }))
    setPages(data.pages ?? [])
    setNavItems(data.navItems ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  // ── Pages ──────────────────────────────────────────────────
  async function startEditPage(p?: CustomPage) {
    if (p) {
      setEditingP(p.id)
      setFormP({ title: p.title, slug: p.slug, icon: p.icon ?? '', published: p.published,
                 showInNav: p.showInNav, navSection: p.navSection, order: p.order })
      const data = await fetch(`/api/pages/${p.id}`).then(r => r.json()).catch(() => ({}))
      setContent(data.content ?? '')
    } else {
      setEditingP('new')
      setFormP(PAGE_INIT)
      setContent('')
    }
  }

  async function savePage() {
    if (!formP.title.trim()) { toast.error('Titre requis'); return }
    setSaving(true)
    try {
      const payload = { ...formP, content, slug: formP.slug || slugify(formP.title) }
      if (editingP === 'new') {
        await fetch('/api/pages', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify(payload),
        })
        toast.success('Page créée')
      } else {
        await fetch(`/api/pages/${editingP}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify(payload),
        })
        toast.success('Page mise à jour')
      }
      setEditingP(null)
      load()
    } catch { toast.error('Erreur') } finally { setSaving(false) }
  }

  async function deletePage(id: string) {
    if (!confirm('Supprimer cette page ?')) return
    await fetch(`/api/pages/${id}`, { method: 'DELETE' })
    toast.success('Page supprimée')
    load()
  }

  // ── NavItems ───────────────────────────────────────────────
  function startEditNav(n?: NavItem) {
    if (n) {
      setEditingN(n.id)
      setFormN({ label: n.label, href: n.href, icon: n.icon ?? '', external: n.external,
                 section: n.section, order: n.order, active: n.active })
    } else {
      setEditingN('new')
      setFormN(NAV_INIT)
    }
  }

  async function saveNav() {
    if (!formN.label.trim() || !formN.href.trim()) { toast.error('Libellé et URL requis'); return }
    setSaving(true)
    try {
      if (editingN === 'new') {
        await fetch('/api/pages', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify({ type: 'navitem', ...formN }),
        })
        toast.success('Lien ajouté')
      } else {
        await fetch(`/api/pages/${editingN}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify({ type: 'navitem', ...formN }),
        })
        toast.success('Lien mis à jour')
      }
      setEditingN(null)
      load()
    } catch { toast.error('Erreur') } finally { setSaving(false) }
  }

  async function deleteNav(id: string) {
    if (!confirm('Supprimer ce lien ?')) return
    await fetch(`/api/pages/${id}?type=navitem`, { method: 'DELETE' })
    toast.success('Lien supprimé')
    load()
  }

  const fP = (k: string, v: unknown) => setFormP(p => ({ ...p, [k]: v }))
  const fN = (k: string, v: unknown) => setFormN(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A3D2B]">Pages & Navigation</h1>
          <p className="text-[#6B8C6A] text-sm">
            {pages.length} page{pages.length !== 1 ? 's' : ''} · {navItems.length} lien{navItems.length !== 1 ? 's' : ''} de nav
          </p>
        </div>
        <button
          onClick={() => tab === 'pages' ? startEditPage() : startEditNav()}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={15} /> {tab === 'pages' ? 'Nouvelle page' : 'Nouveau lien'}
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-[#DBCAA8]">
        {[
          { key: 'pages', label: `📄 Pages (${pages.length})` },
          { key: 'nav',   label: `🔗 Liens nav (${navItems.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    tab === t.key ? 'border-[#1A3D2B] text-[#1A3D2B]' : 'border-transparent text-[#6B8C6A] hover:text-[#1A3D2B]'
                  }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Pages ── */}
      {tab === 'pages' && (
        <div className="space-y-4">
          {editingP && (
            <div className="bg-white border border-[#DBCAA8] rounded-xl p-6 space-y-5">
              <h2 className="font-display font-bold text-[#1A3D2B] text-base">
                {editingP === 'new' ? 'Nouvelle page' : 'Modifier la page'}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Titre *</label>
                  <input className="input w-full" value={formP.title}
                         onChange={e => { fP('title', e.target.value); if (editingP === 'new') fP('slug', slugify(e.target.value)) }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Slug (URL)</label>
                  <div className="flex items-center">
                    <span className="text-xs text-[#9AB09A] bg-[#F2E8D5] border border-r-0 border-[#DBCAA8] px-2 py-2 rounded-l-lg">/p/</span>
                    <input className="input flex-1 rounded-l-none font-mono text-sm" value={formP.slug}
                           onChange={e => fP('slug', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Icône (emoji)</label>
                  <input className="input w-full text-xl" value={formP.icon}
                         onChange={e => fP('icon', e.target.value)} placeholder="📄" maxLength={4} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Section nav</label>
                  <select className="input w-full" value={formP.navSection} onChange={e => fP('navSection', e.target.value)}>
                    {SECTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Ordre</label>
                  <input type="number" className="input w-full" value={formP.order}
                         onChange={e => fP('order', parseInt(e.target.value) || 99)} min={0} />
                </div>
                <div className="flex items-center gap-5 sm:col-span-2 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" className="w-4 h-4 accent-[#1A3D2B]" checked={formP.published}
                           onChange={e => fP('published', e.target.checked)} />
                    <span className="text-[#1A3D2B]">Publiée</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" className="w-4 h-4 accent-[#1A3D2B]" checked={formP.showInNav}
                           onChange={e => fP('showInNav', e.target.checked)} />
                    <span className="text-[#1A3D2B]">Afficher dans la navigation</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Contenu *</label>
                <RichEditor value={content} onChange={setContent} />
              </div>

              <div className="flex items-center gap-3">
                <button onClick={savePage} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                  <Check size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={() => setEditingP(null)} className="btn-secondary flex items-center gap-2 text-sm">
                  <X size={14} /> Annuler
                </button>
              </div>
            </div>
          )}

          <div className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden">
            {pages.length === 0 ? (
              <p className="text-center py-10 text-[#9AB09A]">Aucune page personnalisée.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DBCAA8] bg-[#F2E8D5]">
                    <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase">Titre</th>
                    <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase hidden md:table-cell">URL</th>
                    <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase">Statut</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {pages.map(p => (
                    <tr key={p.id} className="border-b border-[#DBCAA8] hover:bg-[#F2E8D5]/40">
                      <td className="px-5 py-3.5 font-medium text-[#1A3D2B]">
                        {p.icon && <span className="mr-1.5">{p.icon}</span>}{p.title}
                      </td>
                      <td className="px-5 py-3.5 text-[#9AB09A] font-mono text-xs hidden md:table-cell">/p/{p.slug}</td>
                      <td className="px-5 py-3.5">
                        {p.published
                          ? <span className="text-[#3A7A52] text-xs font-semibold flex items-center gap-1"><Eye size={11} /> Publiée</span>
                          : <span className="text-[#9AB09A] text-xs font-semibold flex items-center gap-1"><EyeOff size={11} /> Brouillon</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => startEditPage(p)}
                                  className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A]"><Pencil size={13} /></button>
                          <button onClick={() => deletePage(p.id)}
                                  className="p-1.5 hover:bg-red-50 rounded-lg text-[#9AB09A] hover:text-red-500"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Liens nav ── */}
      {tab === 'nav' && (
        <div className="space-y-4">
          <div className="bg-[#FBF0C8] border border-[rgba(212,168,32,0.3)] rounded-xl p-4 text-sm text-[#A07810]">
            <strong>💡 Info :</strong> Les liens ajoutés ici apparaissent dans la navigation principale du site,
            dans la section choisie. Les pages custom créées ci-dessus s'y ajoutent automatiquement si "Afficher dans la navigation" est coché.
          </div>

          {editingN && (
            <div className="bg-white border border-[#DBCAA8] rounded-xl p-6 space-y-4">
              <h2 className="font-display font-bold text-[#1A3D2B] text-base">
                {editingN === 'new' ? 'Nouveau lien' : 'Modifier le lien'}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Libellé *</label>
                  <input className="input w-full" value={formN.label}
                         onChange={e => fN('label', e.target.value)} placeholder="Ma page" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">URL *</label>
                  <input className="input w-full" value={formN.href}
                         onChange={e => fN('href', e.target.value)}
                         placeholder="/ma-page ou https://exemple.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Icône (emoji)</label>
                  <input className="input w-full text-xl" value={formN.icon}
                         onChange={e => fN('icon', e.target.value)} placeholder="🔗" maxLength={4} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Section</label>
                  <select className="input w-full" value={formN.section} onChange={e => fN('section', e.target.value)}>
                    {SECTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B8C6A] mb-1.5">Ordre</label>
                  <input type="number" className="input w-full" value={formN.order}
                         onChange={e => fN('order', parseInt(e.target.value) || 99)} min={0} />
                </div>
                <div className="flex items-center gap-5 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" className="w-4 h-4 accent-[#1A3D2B]" checked={formN.external}
                           onChange={e => fN('external', e.target.checked)} />
                    <span className="text-[#1A3D2B] flex items-center gap-1"><ExternalLink size={12} /> Lien externe</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" className="w-4 h-4 accent-[#1A3D2B]" checked={formN.active}
                           onChange={e => fN('active', e.target.checked)} />
                    <span className="text-[#1A3D2B]">Actif</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={saveNav} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                  <Check size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button onClick={() => setEditingN(null)} className="btn-secondary flex items-center gap-2 text-sm">
                  <X size={14} /> Annuler
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {navItems.length === 0 && !editingN ? (
              <div className="bg-white border border-[#DBCAA8] rounded-xl p-8 text-center text-[#9AB09A]">
                Aucun lien personnalisé.
              </div>
            ) : navItems.map(n => (
              <div key={n.id} className={`bg-white border border-[#DBCAA8] rounded-xl px-5 py-3.5 flex items-center gap-4 ${!n.active ? 'opacity-50' : ''}`}>
                <span className="text-xl flex-shrink-0">{n.icon ?? '🔗'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[#1A3D2B] flex items-center gap-2">
                    {n.label}
                    {n.external && <ExternalLink size={11} className="text-[#9AB09A]" />}
                    {!n.active && <span className="text-[10px] text-[#9AB09A]">(inactif)</span>}
                  </div>
                  <div className="text-xs text-[#9AB09A] font-mono truncate">{n.href}</div>
                  <div className="text-[10px] text-[#9AB09A]">{SECTIONS.find(s => s.key === n.section)?.label}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEditNav(n)}
                          className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A]"><Pencil size={13} /></button>
                  <button onClick={() => deleteNav(n.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-[#9AB09A] hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
