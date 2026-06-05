'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RichEditor } from './RichEditor'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Save, Eye, EyeOff } from 'lucide-react'

interface ArticleFormProps {
  article?: {
    id:         string
    title:      string
    slug:       string
    excerpt?:   string | null
    content:    string
    coverImage?: string | null
    category:   string
    published:  boolean
    pinned:     boolean
    metaTitle?: string | null
    metaDesc?:  string | null
  }
}

export function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title:      article?.title      ?? '',
    slug:       article?.slug       ?? '',
    excerpt:    article?.excerpt    ?? '',
    content:    article?.content    ?? '',
    coverImage: article?.coverImage ?? '',
    category:   article?.category   ?? 'news',
    published:  article?.published  ?? false,
    pinned:     article?.pinned     ?? false,
    metaTitle:  article?.metaTitle  ?? '',
    metaDesc:   article?.metaDesc   ?? '',
  })

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: article ? f.slug : slugify(title),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.content) { toast.error('Le contenu est requis'); return }
    setLoading(true)
    try {
      const res = await fetch(article ? `/api/articles/${article.id}` : '/api/articles', {
        method:  article ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erreur')
      }
      toast.success(article ? 'Article mis à jour !' : 'Article créé !')
      router.push('/admin/articles')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const f = (key: string, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Main fields */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-[#E8F5EE] text-sm mb-0">Contenu</h2>

        <div>
          <label className="block text-xs text-[#9DC4AD] mb-1.5 font-medium">Titre *</label>
          <input
            type="text" required value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Titre de l'article"
            className="input"
          />
        </div>

        <div>
          <label className="block text-xs text-[#9DC4AD] mb-1.5 font-medium">Slug (URL)</label>
          <input
            type="text" value={form.slug}
            onChange={(e) => f('slug', slugify(e.target.value))}
            className="input font-mono text-[#52B788]"
          />
          <p className="text-[10px] text-[#5A8A6A] mt-1">voilectia.fr/actualites/{form.slug || 'votre-article'}</p>
        </div>

        <div>
          <label className="block text-xs text-[#9DC4AD] mb-1.5 font-medium">Résumé</label>
          <textarea
            rows={2} value={form.excerpt}
            onChange={(e) => f('excerpt', e.target.value)}
            placeholder="Court résumé affiché dans les listes..."
            className="input resize-none"
          />
        </div>

        <div>
          <label className="block text-xs text-[#9DC4AD] mb-1.5 font-medium">Contenu *</label>
          <RichEditor value={form.content} onChange={(v) => f('content', v)} placeholder="Rédigez votre article..." />
        </div>
      </div>

      {/* Options */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-[#E8F5EE] text-sm">Options</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5 font-medium">Catégorie</label>
            <select value={form.category} onChange={(e) => f('category', e.target.value)} className="input">
              <option value="news">Actualité</option>
              <option value="announcement">Annonce</option>
              <option value="update">Mise à jour</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#9DC4AD] mb-1.5 font-medium">Image de couverture (URL)</label>
            <input
              type="url" value={form.coverImage}
              onChange={(e) => f('coverImage', e.target.value)}
              placeholder="https://..."
              className="input"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => f('published', e.target.checked)}
              className="w-4 h-4 accent-[#52B788]"
            />
            <span className="text-sm text-[#9DC4AD]">Publié</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => f('pinned', e.target.checked)}
              className="w-4 h-4 accent-[#D4A017]"
            />
            <span className="text-sm text-[#9DC4AD]">Épinglé</span>
          </label>
        </div>
      </div>

      {/* SEO */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-[#E8F5EE] text-sm">SEO (optionnel)</h2>
        <div>
          <label className="block text-xs text-[#9DC4AD] mb-1.5">Meta titre</label>
          <input value={form.metaTitle} onChange={(e) => f('metaTitle', e.target.value)} className="input" placeholder="Laissez vide pour utiliser le titre" />
        </div>
        <div>
          <label className="block text-xs text-[#9DC4AD] mb-1.5">Meta description</label>
          <textarea rows={2} value={form.metaDesc} onChange={(e) => f('metaDesc', e.target.value)} className="input resize-none" placeholder="Description pour les moteurs de recherche..." />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 justify-end">
        <button type="button" onClick={() => router.back()} className="btn-ghost text-sm">
          Annuler
        </button>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {article ? 'Mettre à jour' : 'Créer l\'article'}
        </button>
      </div>
    </form>
  )
}
