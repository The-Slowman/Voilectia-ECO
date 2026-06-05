'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, ChevronDown, ChevronRight, Save, Check } from 'lucide-react'
import toast from 'react-hot-toast'

/* ─── Configuration des pages et de leurs blocs éditables ─── */
const SITE_PAGES: {
  slug: string
  label: string
  icon: string
  blocks: { key: string; label: string; type: 'text' | 'html'; multiline?: boolean }[]
}[] = [
  {
    slug: 'presentation', label: 'Présentation', icon: '🌿',
    blocks: [
      { key: 'history_title',   label: 'Titre "Histoire"',          type: 'text' },
      { key: 'history_intro',   label: 'Introduction histoire',     type: 'html', multiline: true },
      { key: 'philosophy_title',label: 'Titre "Philosophie"',       type: 'text' },
      { key: 'fonctionnement_title', label: 'Titre "Fonctionnement"', type: 'text' },
    ],
  },
  {
    slug: 'economie', label: 'Économie', icon: '💰',
    blocks: [
      { key: 'vlc_title',       label: 'Titre VLC',                  type: 'text' },
      { key: 'vlc_intro',       label: 'Texte intro VLC',            type: 'html', multiline: true },
      { key: 'ecognome_title',  label: 'Titre EcoGnome',             type: 'text' },
      { key: 'ecognome_intro',  label: 'Texte intro EcoGnome',       type: 'html', multiline: true },
    ],
  },
  {
    slug: 'federation', label: 'Fédération', icon: '🏛️',
    blocks: [
      { key: 'intro_title',     label: 'Titre intro',                type: 'text' },
      { key: 'intro_text',      label: 'Texte intro',                type: 'html', multiline: true },
      { key: 'missions_title',  label: 'Titre missions',             type: 'text' },
      { key: 'contact_title',   label: 'Titre contact',              type: 'text' },
      { key: 'contact_text',    label: 'Texte contact',              type: 'text', multiline: true },
    ],
  },
  {
    slug: 'reglement', label: 'Règlement', icon: '📜',
    blocks: [
      { key: 'intro',           label: 'Introduction',               type: 'html', multiline: true },
    ],
  },
  {
    slug: 'accueil', label: 'Accueil', icon: '🏠',
    blocks: [
      { key: 'hero_title',      label: 'Titre hero',                 type: 'text' },
      { key: 'hero_subtitle',   label: 'Sous-titre hero',            type: 'text' },
      { key: 'hero_cta',        label: 'Texte bouton principal',     type: 'text' },
    ],
  },
  {
    slug: 'soutenir', label: 'Soutenir', icon: '❤️',
    blocks: [
      { key: 'title',           label: 'Titre',                      type: 'text' },
      { key: 'intro',           label: 'Introduction',               type: 'html', multiline: true },
    ],
  },
]

type BlockValues = Record<string, string>

export default function AdminContenusPage() {
  const [openPage,  setOpenPage]  = useState<string | null>(null)
  const [contents,  setContents]  = useState<Record<string, BlockValues>>({})
  const [saving,    setSaving]    = useState<string | null>(null)
  const [saved,     setSaved]     = useState<string | null>(null)

  const loadPage = useCallback(async (slug: string) => {
    if (contents[slug]) return
    const res = await fetch(`/api/page-content?page=${slug}`)
    const data = await res.json()
    setContents(prev => ({ ...prev, [slug]: data }))
  }, [contents])

  function togglePage(slug: string) {
    if (openPage === slug) { setOpenPage(null); return }
    setOpenPage(slug)
    loadPage(slug)
  }

  function updateBlock(page: string, key: string, value: string) {
    setContents(prev => ({
      ...prev,
      [page]: { ...(prev[page] ?? {}), [key]: value },
    }))
  }

  async function savePage(slug: string) {
    const pageDef = SITE_PAGES.find(p => p.slug === slug)
    if (!pageDef) return
    setSaving(slug)
    try {
      await Promise.all(
        pageDef.blocks.map(block =>
          fetch('/api/page-content', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              page:  slug,
              key:   block.key,
              value: contents[slug]?.[block.key] ?? '',
              type:  block.type,
              label: block.label,
            }),
          })
        )
      )
      toast.success('Contenu sauvegardé !')
      setSaved(slug)
      setTimeout(() => setSaved(null), 2000)
    } catch {
      toast.error('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <FileText size={22} className="text-[#52B788]" />
        <div>
          <h1 className="font-display text-2xl font-bold text-[#E8F5EE]">Contenus des pages</h1>
          <p className="text-[#9DC4AD] text-sm mt-0.5">
            Modifie les textes affichés sur chaque page du site sans toucher au code.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {SITE_PAGES.map(pageDef => {
          const isOpen    = openPage === pageDef.slug
          const isSaving  = saving  === pageDef.slug
          const isSaved   = saved   === pageDef.slug
          const pageData  = contents[pageDef.slug] ?? {}

          return (
            <div key={pageDef.slug} className="card-dark border border-[rgba(82,183,136,0.12)] overflow-hidden">
              <button
                onClick={() => togglePage(pageDef.slug)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[rgba(255,255,255,0.03)] transition-colors"
              >
                <span className="text-xl">{pageDef.icon}</span>
                <span className="flex-1 font-semibold text-[#E8F5EE] text-sm">{pageDef.label}</span>
                <span className="text-xs text-[#5A8A6A]">{pageDef.blocks.length} bloc{pageDef.blocks.length > 1 ? 's' : ''}</span>
                {isOpen
                  ? <ChevronDown size={16} className="text-[#9DC4AD]" />
                  : <ChevronRight size={16} className="text-[#9DC4AD]" />
                }
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-[rgba(82,183,136,0.1)]">
                  <div className="space-y-4 pt-4">
                    {pageDef.blocks.map(block => (
                      <div key={block.key}>
                        <label className="block text-xs text-[#9DC4AD] mb-1.5 font-medium">
                          {block.label}
                          {block.type === 'html' && (
                            <span className="ml-1.5 text-[10px] text-[#52B788] bg-[rgba(82,183,136,0.1)] px-1.5 py-0.5 rounded">HTML</span>
                          )}
                        </label>
                        {block.multiline ? (
                          <textarea
                            value={pageData[block.key] ?? ''}
                            onChange={e => updateBlock(pageDef.slug, block.key, e.target.value)}
                            className="input-dark w-full resize-y font-mono text-xs"
                            rows={block.type === 'html' ? 6 : 3}
                            placeholder={block.type === 'html' ? '<p>Texte HTML…</p>' : 'Texte…'}
                          />
                        ) : (
                          <input
                            value={pageData[block.key] ?? ''}
                            onChange={e => updateBlock(pageDef.slug, block.key, e.target.value)}
                            className="input-dark w-full"
                            placeholder="Texte…"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => savePage(pageDef.slug)}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#52B788] text-white text-sm font-semibold hover:bg-[#3A7A52] transition-colors disabled:opacity-60"
                    >
                      {isSaved
                        ? <><Check size={14} /> Sauvegardé</>
                        : isSaving
                          ? <><span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> Sauvegarde…</>
                          : <><Save size={14} /> Sauvegarder</>
                      }
                    </button>
                    <p className="text-xs text-[#5A8A6A]">
                      Les modifications sont visibles immédiatement sur le site.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
