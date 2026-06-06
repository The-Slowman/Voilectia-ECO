'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, MessageSquare, User, Calendar, Send, Eye, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { ForumReactions } from '@/components/forum/ForumReactions'
import { ForumReportButton } from '@/components/forum/ForumReportButton'

interface Post {
  id: string; title: string; content: string; authorName: string
  createdAt: string; views: number; closed: boolean
  category: { name: string; slug: string; color: string | null; icon: string | null }
  comments: Comment[]
  _count: { reactions: number }
}
interface Comment {
  id: string; content: string; authorName: string; createdAt: string
  _count?: { reactions: number }
}
interface PlayerMe { id: string; username: string; email: string; avatar: string | null }

export default function ForumPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post,    setPost]    = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [player,  setPlayer]  = useState<PlayerMe | null>(null)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)

  useEffect(() => {
    fetch(`/api/forum/posts/${params.slug}`)
      .then(r => r.json())
      .then(data => { setPost(data); setLoading(false) })
      .catch(() => setLoading(false))

    fetch('/api/player/auth/me')
      .then(r => r.json())
      .then(data => { if (data) setPlayer(data) })
      .catch(() => {})
  }, [params.slug])

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!post) return
    if (!player) {
      router.push(`/connexion?redirect=/forum/${post.category.slug}/${params.slug}`)
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/forum/comments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ postId: post.id, content }),
      })
      if (res.status === 401) {
        toast.error('Session expirée. Reconnectez-vous.')
        router.push(`/connexion?redirect=/forum/${post.category.slug}/${params.slug}`)
        return
      }
      if (res.status === 403) {
        toast.error('Ce post est fermé aux nouveaux commentaires.')
        return
      }
      if (!res.ok) throw new Error()
      setSent(true)
      toast.success('Commentaire soumis — il sera visible après modération.')
      setContent('')
    } catch {
      toast.error('Erreur lors de l\'envoi.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#1A3D2B] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!post) return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center text-[#6B8C6A]">
      Post introuvable.
    </div>
  )

  const accentColor = post.category.color ?? '#3A7A52'

  return (
    <div className="bg-[#F2E8D5] min-h-screen">

      {/* Header */}
      <div className="bg-[#1A3D2B] pt-24 pb-10 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px]
                        bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-[rgba(242,232,213,0.5)] text-xs mb-4">
            <Link href="/forum" className="hover:text-[#F2E8D5] transition-colors">Forum</Link>
            <ChevronLeft size={12} className="rotate-180" />
            <Link href={`/forum/${post.category.slug}`} className="hover:text-[#F2E8D5] transition-colors">
              {post.category.name}
            </Link>
          </div>
          <div className="flex items-start gap-3 mb-3">
            {post.closed && (
              <span className="mt-1.5 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
                               bg-[rgba(255,255,255,0.1)] text-[rgba(242,232,213,0.6)] flex-shrink-0">
                <Lock size={10} /> Fermé
              </span>
            )}
            <h1 className="font-display font-bold text-2xl md:text-3xl text-[#F2E8D5]">
              {post.title}
            </h1>
          </div>
          <div className="flex items-center gap-5 text-[rgba(242,232,213,0.5)] text-xs flex-wrap">
            <span className="flex items-center gap-1.5"><User size={11} /> {post.authorName}</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={11} />
              {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5"><Eye size={11} /> {post.views} vues</span>
            <span className="flex items-center gap-1.5">
              <MessageSquare size={11} /> {post.comments.length} commentaire{post.comments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* Contenu du post */}
        <div className="bg-white border border-[#DBCAA8] rounded-xl p-6 md:p-8 mb-6"
             style={{ borderTop: `4px solid ${accentColor}` }}>
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* Réactions + signalement sous le post */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#DBCAA8] flex-wrap gap-3">
            <ForumReactions postId={post.id} accentColor={accentColor} />
            <ForumReportButton postId={post.id} />
          </div>
        </div>

        {/* Bannière post fermé */}
        {post.closed && (
          <div className="bg-[#F2E8D5] border border-[#DBCAA8] rounded-xl px-5 py-4 mb-6
                          flex items-center gap-3 text-sm text-[#6B8C6A]">
            <Lock size={16} className="text-[#9AB09A] flex-shrink-0" />
            <span>Ce post est fermé — les nouveaux commentaires ne sont plus acceptés.</span>
          </div>
        )}

        {/* Commentaires */}
        <div className="mb-8">
          <h2 className="font-display font-bold text-[#1A3D2B] text-lg mb-4 flex items-center gap-2">
            <MessageSquare size={18} style={{ color: accentColor }} />
            Commentaires ({post.comments.length})
          </h2>

          {post.comments.length === 0 ? (
            <div className="bg-white border border-[#DBCAA8] rounded-xl p-6 text-center text-[#6B8C6A] text-sm">
              {post.closed
                ? 'Ce post est fermé.'
                : 'Aucun commentaire pour le moment. Soyez le premier !'}
            </div>
          ) : (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id}
                     className="bg-white border border-[#DBCAA8] rounded-xl p-5 flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#E8D9BF] border border-[#DBCAA8]
                                  flex items-center justify-center font-display font-bold text-sm
                                  text-[#1A3D2B] flex-shrink-0">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-sm text-[#1A3D2B]">{comment.authorName}</span>
                      <span className="text-[10px] text-[#9AB09A]">
                        {new Date(comment.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B8C6A] leading-relaxed whitespace-pre-wrap mb-3">
                      {comment.content}
                    </p>
                    {/* Réactions + signalement sur les commentaires */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <ForumReactions commentId={comment.id} accentColor={accentColor} />
                      <ForumReportButton commentId={comment.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulaire commentaire */}
        {!post.closed && (
          <div className="bg-white border border-[#DBCAA8] rounded-xl p-6"
               style={{ borderTop: `3px solid ${accentColor}` }}>
            <h3 className="font-display font-bold text-[#1A3D2B] mb-4">Laisser un commentaire</h3>

            {!player ? (
              /* Pas connecté */
              <div className="text-center py-6">
                <p className="text-[#6B8C6A] text-sm mb-4">
                  Vous devez être connecté pour laisser un commentaire.
                </p>
                <Link
                  href={`/connexion?redirect=/forum/${post.category.slug}/${params.slug}`}
                  className="btn-primary inline-flex items-center gap-2">
                  <User size={15} /> Se connecter
                </Link>
              </div>
            ) : sent ? (
              <div className="text-center py-4">
                <p className="text-[#3A7A52] font-semibold mb-1">✅ Commentaire envoyé !</p>
                <p className="text-[#6B8C6A] text-sm">Il sera visible après validation par un modérateur.</p>
                <button onClick={() => setSent(false)} className="mt-3 text-sm text-[#3A7A52] hover:underline">
                  Poster un autre commentaire
                </button>
              </div>
            ) : (
              <form onSubmit={handleComment} className="space-y-4">
                {/* Bandeau joueur connecté */}
                <div className="bg-[#EAF4EC] border border-[rgba(58,122,82,0.3)] rounded-lg p-3
                                flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#3A7A52] flex items-center justify-center
                                  text-white font-bold text-xs flex-shrink-0">
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-[#4A8A62]">
                    Vous commentez en tant que{' '}
                    <span className="font-semibold text-[#1A3D2B]">{player.username}</span>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B8C6A] mb-1.5">Commentaire *</label>
                  <textarea required rows={4} value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Votre commentaire…" className="input resize-none"
                            maxLength={2000} />
                  <div className="text-right text-[10px] text-[#9AB09A] mt-1">{content.length}/2000</div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-[#9AB09A] italic">
                    Les commentaires sont modérés avant publication.
                  </p>
                  <button type="submit" disabled={sending}
                          className="btn-primary disabled:opacity-60 flex items-center gap-2">
                    {sending
                      ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <Send size={15} />}
                    Envoyer
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
