'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Send, Info, User } from 'lucide-react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const RichEditor = dynamic(
  () => import('@/components/admin/RichEditor').then(m => m.RichEditor),
  { ssr: false, loading: () => <div className="input min-h-[200px] animate-pulse" /> }
)

interface Category { id: string; name: string; slug: string; icon: string | null; color: string | null }
interface PlayerMe  { id: string; username: string; email: string; avatar: string | null }

export default function NouveauPostPage() {
  const router = useRouter()
  const [player,     setPlayer]     = useState<PlayerMe | null>(null)
  const [checking,   setChecking]   = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(false)
  const [sent,       setSent]       = useState(false)
  const [form, setForm] = useState({ title: '', categoryId: '', content: '', excerpt: '' })

  useEffect(() => {
    fetch('/api/player/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data) {
          router.replace('/connexion?redirect=/forum/nouveau')
        } else {
          setPlayer(data)
        }
        setChecking(false)
      })
      .catch(() => {
        router.replace('/connexion?redirect=/forum/nouveau')
      })

    fetch('/api/forum/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [router])

  const f = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.content || form.content === '<p></p>') {
      toast.error('Le contenu est requis.')
      return
    }
    if (!form.categoryId) {
      toast.error('Choisissez une catégorie.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/forum/posts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (res.status === 401) {
        toast.error('Session expirée. Reconnectez-vous.')
        router.push('/connexion?redirect=/forum/nouveau')
        return
      }
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      toast.error('Erreur lors de l\'envoi. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center">
      <div className="w-8 h-8 border-[3px] border-[#1A3D2B] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (sent) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center px-4">
      <div className="bg-white border border-[#DBCAA8] rounded-xl p-10 text-center max-w-md w-full"
           style={{ borderTop: '4px solid #3A7A52' }}>
        <div className="text-5xl mb-5">✅</div>
        <h2 className="font-display font-bold text-[#1A3D2B] text-xl mb-3">Post soumis !</h2>
        <p className="text-[#6B8C6A] text-sm mb-6 leading-relaxed">
          Votre post a bien été reçu. Il sera visible après validation par un modérateur.
          Merci pour votre contribution !
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/forum" className="btn-primary">Retour au forum</Link>
          <button onClick={() => { setSent(false); setForm({ title: '', categoryId: '', content: '', excerpt: '' }) }}
                  className="btn-ghost">Nouveau post</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-[#F2E8D5] min-h-screen">

      {/* Header */}
      <div className="bg-[#1A3D2B] pt-24 pb-10 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px]
                        bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/forum"
                className="inline-flex items-center gap-1.5 text-[rgba(242,232,213,0.5)]
                           hover:text-[#F2E8D5] text-xs mb-4 transition-colors">
            <ChevronLeft size={13} /> Retour au forum
          </Link>
          <h1 className="font-display font-bold text-3xl text-[#F2E8D5]">Nouveau post</h1>
          <p className="text-[rgba(242,232,213,0.5)] text-sm mt-1 italic"
             style={{ fontFamily: 'var(--font-lora)' }}>
            Partagez un tutoriel, une astuce ou une découverte avec la communauté.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* Bandeau compte connecté */}
        {player && (
          <div className="bg-[#EAF4EC] border border-[rgba(58,122,82,0.3)] rounded-xl p-3.5
                          flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-[#3A7A52] flex items-center justify-center
                            text-white font-bold text-sm flex-shrink-0">
              {player.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-[#4A8A62] font-medium">Connecté en tant que </span>
              <span className="text-sm font-semibold text-[#1A3D2B]">{player.username}</span>
            </div>
            <User size={14} className="text-[#4A8A62] flex-shrink-0" />
          </div>
        )}

        {/* Info modération */}
        <div className="bg-[#FBF0C8] border border-[rgba(212,168,32,0.3)] rounded-xl p-4
                        flex gap-3 mb-6">
          <Info size={16} className="text-[#D4A820] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#A07810]">
            Votre post sera soumis à modération avant d'être publié. Comptez généralement moins de 24h.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Contenu */}
          <div className="bg-white border border-[#DBCAA8] rounded-xl p-5 space-y-4">
            <h2 className="font-display font-semibold text-[#1A3D2B] text-sm">Contenu du post</h2>

            <div>
              <label className="block text-xs font-medium text-[#6B8C6A] mb-1.5">Catégorie *</label>
              <select required value={form.categoryId} onChange={e => f('categoryId', e.target.value)}
                      className="input">
                <option value="">— Choisir une catégorie —</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B8C6A] mb-1.5">Titre *</label>
              <input type="text" required value={form.title}
                     onChange={e => f('title', e.target.value)}
                     placeholder="Titre clair et descriptif de votre post"
                     className="input" />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B8C6A] mb-1.5">Résumé (optionnel)</label>
              <input type="text" value={form.excerpt}
                     onChange={e => f('excerpt', e.target.value)}
                     placeholder="Court résumé affiché dans la liste"
                     className="input" />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B8C6A] mb-1.5">Contenu *</label>
              <RichEditor
                value={form.content}
                onChange={v => f('content', v)}
                placeholder="Rédigez votre tutoriel ou astuce ici..."
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/forum" className="btn-ghost">Annuler</Link>
            <button type="submit" disabled={loading}
                    className="btn-gold disabled:opacity-60 flex items-center gap-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Send size={16} />}
              Soumettre le post
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
