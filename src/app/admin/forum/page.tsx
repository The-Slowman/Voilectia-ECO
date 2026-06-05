'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Eye, Pin, PinOff, Lock, Unlock, Pencil, Trash2,
  MessageSquare, AlertTriangle, Plus, Check, X,
  ChevronDown, ChevronUp, Flag
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Post {
  id: string; title: string; slug: string; authorName: string
  approved: boolean; pinned: boolean; closed: boolean; views: number; createdAt: string
  category: { name: string; slug: string; color: string | null }
  _count: { comments: number }
}
interface Comment {
  id: string; content: string; authorName: string; approved: boolean; createdAt: string
  post: { title: string; slug: string; category: { slug: string } }
}
interface Category { id: string; name: string; color: string | null }
interface Report {
  id: string; reason: string; details: string | null; status: string; createdAt: string
  post:    { id: string; title: string; slug: string; category: { slug: string } } | null
  comment: { id: string; content: string; authorName: string } | null
}

const REASON_LABELS: Record<string, string> = {
  'spam':                '🚫 Spam',
  'harcelement':         '⚠️ Harcèlement',
  'hors-sujet':          '📌 Hors sujet',
  'contenu-inapproprie': '🔞 Contenu inapproprié',
  'autre':               '❓ Autre',
}

export default function AdminForumPage() {
  const [tab,        setTab]        = useState<'posts' | 'comments' | 'reports'>('posts')
  const [posts,      setPosts]      = useState<Post[]>([])
  const [comments,   setComments]   = useState<Comment[]>([])
  const [reports,    setReports]    = useState<Report[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [editTitle,  setEditTitle]  = useState('')
  const [editCat,    setEditCat]    = useState('')
  const [expanded,   setExpanded]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [pRes, cRes, rRes, catRes] = await Promise.all([
      fetch('/api/forum/posts?admin=1&limit=100').then(r => r.json()).catch(() => ({ posts: [] })),
      fetch('/api/forum/comments?pending=1').then(r => r.json()).catch(() => []),
      fetch('/api/forum/reports?status=pending').then(r => r.json()).catch(() => []),
      fetch('/api/forum/categories').then(r => r.json()).catch(() => []),
    ])
    setPosts(pRes.posts ?? [])
    setComments(Array.isArray(cRes) ? cRes : [])
    setReports(Array.isArray(rRes) ? rRes : [])
    setCategories(Array.isArray(catRes) ? catRes : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function patchPost(id: string, data: Record<string, unknown>) {
    await fetch(`/api/forum/posts/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    load()
  }

  async function deletePost(id: string) {
    if (!confirm('Supprimer définitivement ce post et tous ses commentaires ?')) return
    await fetch(`/api/forum/posts/${id}`, { method: 'DELETE' })
    toast.success('Post supprimé')
    load()
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) { toast.error('Titre requis'); return }
    const payload: Record<string, unknown> = { title: editTitle }
    if (editCat) payload.categoryId = editCat
    await patchPost(id, payload)
    toast.success('Post mis à jour')
    setEditingId(null)
  }

  function startEdit(post: Post) {
    setEditingId(post.id)
    setEditTitle(post.title)
    const cat = categories.find(c => c.name === post.category.name)
    setEditCat(cat?.id ?? '')
  }

  async function patchComment(id: string, data: Record<string, unknown>) {
    await fetch(`/api/forum/comments/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    load()
  }

  async function deleteComment(id: string) {
    if (!confirm('Supprimer ce commentaire ?')) return
    await fetch(`/api/forum/comments/${id}`, { method: 'DELETE' })
    toast.success('Commentaire supprimé')
    load()
  }

  async function resolveReport(id: string, status: 'reviewed' | 'dismissed') {
    await fetch('/api/forum/reports', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }),
    })
    toast.success(status === 'reviewed' ? 'Signalement traité' : 'Signalement ignoré')
    load()
  }

  const pendingPosts    = posts.filter(p => !p.approved).length
  const pendingComments = comments.filter(c => !c.approved).length
  const pendingReports  = reports.length

  const TABS = [
    { key: 'posts',    label: `Posts (${posts.length})${pendingPosts > 0 ? ` · 🟠 ${pendingPosts}` : ''}` },
    { key: 'comments', label: `Commentaires${pendingComments > 0 ? ` · 🟠 ${pendingComments}` : ''}` },
    { key: 'reports',  label: `Signalements${pendingReports > 0 ? ` · 🔴 ${pendingReports}` : ''}` },
  ] as const

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A3D2B]">Forum</h1>
          <p className="text-[#6B8C6A] text-sm">
            {pendingPosts > 0 && <span className="text-orange-500 font-semibold">{pendingPosts} en attente · </span>}
            {posts.filter(p => p.approved).length} publiés
            {pendingReports > 0 && <span className="text-red-500 font-semibold"> · {pendingReports} signalement{pendingReports > 1 ? 's' : ''}</span>}
          </p>
        </div>
        <Link href="/admin/forum/categories" className="btn-primary text-sm flex items-center gap-2">
          <Plus size={15} /> Catégories
        </Link>
      </div>

      <div className="flex gap-1 border-b border-[#DBCAA8]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    tab === t.key ? 'border-[#1A3D2B] text-[#1A3D2B]' : 'border-transparent text-[#6B8C6A] hover:text-[#1A3D2B]'
                  }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-[#F2E8D5] rounded-xl animate-pulse" />)}</div>
      ) : (
        <>

          {/* ── POSTS ── */}
          {tab === 'posts' && (
            <div className="space-y-6">

              {/* En attente */}
              {pendingPosts > 0 && (
                <section>
                  <h2 className="font-display font-semibold text-[#1A3D2B] text-sm mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    En attente de modération
                  </h2>
                  <div className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-[#DBCAA8] bg-[#FFF8E8]">
                        <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase">Titre</th>
                        <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase hidden md:table-cell">Auteur</th>
                        <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase hidden lg:table-cell">Catégorie</th>
                        <th className="px-5 py-3" />
                      </tr></thead>
                      <tbody>
                        {posts.filter(p => !p.approved).map(post => (
                          <tr key={post.id} className="border-b border-[#DBCAA8] hover:bg-[#FFF8E8]/60">
                            <td className="px-5 py-3.5 font-medium text-[#1A3D2B] max-w-[220px] truncate">{post.title}</td>
                            <td className="px-5 py-3.5 text-[#6B8C6A] hidden md:table-cell">{post.authorName}</td>
                            <td className="px-5 py-3.5 hidden lg:table-cell">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: `${post.category.color ?? '#3A7A52'}15`, color: post.category.color ?? '#3A7A52' }}>
                                {post.category.name}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2 justify-end">
                                <button onClick={() => { patchPost(post.id, { approved: true }); toast.success('Post approuvé') }}
                                        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-[rgba(58,122,82,0.1)] text-[#2D6A4F] hover:bg-[rgba(58,122,82,0.2)]">
                                  <Check size={12} /> Approuver
                                </button>
                                <button onClick={() => deletePost(post.id)}
                                        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                                  <X size={12} /> Refuser
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Publiés */}
              <section>
                <h2 className="font-display font-semibold text-[#1A3D2B] text-sm mb-3">
                  Posts publiés ({posts.filter(p => p.approved).length})
                </h2>
                <div className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-[#DBCAA8] bg-[#F2E8D5]">
                      <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase">Titre</th>
                      <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase hidden md:table-cell">Auteur</th>
                      <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase hidden lg:table-cell">Catégorie</th>
                      <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase hidden lg:table-cell">Stats</th>
                      <th className="px-5 py-3 text-center text-[#6B8C6A] font-semibold text-xs uppercase">Outils</th>
                    </tr></thead>
                    <tbody>
                      {posts.filter(p => p.approved).map(post => (
                        <>
                          <tr key={post.id}
                              className={`border-b border-[#DBCAA8] hover:bg-[#F2E8D5]/40 transition-colors ${post.closed ? 'opacity-60' : ''}`}>
                            <td className="px-5 py-3.5">
                              {editingId === post.id ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <input className="input text-sm" style={{ minWidth: 140 }}
                                         value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                         onKeyDown={e => e.key === 'Enter' && saveEdit(post.id)} autoFocus />
                                  <select className="input text-xs py-1" value={editCat}
                                          onChange={e => setEditCat(e.target.value)}>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  </select>
                                  <button onClick={() => saveEdit(post.id)}
                                          className="p-1.5 bg-[rgba(58,122,82,0.1)] text-[#2D6A4F] rounded-lg">
                                    <Check size={13} />
                                  </button>
                                  <button onClick={() => setEditingId(null)}
                                          className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#9AB09A]">
                                    <X size={13} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 font-medium text-[#1A3D2B] max-w-[200px]">
                                  {post.pinned && <Pin size={11} className="text-[#D4A820] flex-shrink-0" />}
                                  {post.closed && <Lock size={11} className="text-[#9AB09A] flex-shrink-0" />}
                                  <span className="truncate">{post.title}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-[#6B8C6A] hidden md:table-cell">{post.authorName}</td>
                            <td className="px-5 py-3.5 hidden lg:table-cell">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: `${post.category.color ?? '#3A7A52'}15`, color: post.category.color ?? '#3A7A52' }}>
                                {post.category.name}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 hidden lg:table-cell">
                              <div className="flex items-center gap-3 text-xs text-[#9AB09A]">
                                <span className="flex items-center gap-1"><Eye size={11} />{post.views}</span>
                                <span className="flex items-center gap-1"><MessageSquare size={11} />{post._count.comments}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1 justify-end flex-wrap">

                                {/* Épingler */}
                                <button onClick={() => { patchPost(post.id, { pinned: !post.pinned }); toast.success(post.pinned ? 'Dépinglé' : 'Épinglé 📌') }}
                                        title={post.pinned ? 'Dépingler' : 'Épingler'}
                                        className={`p-1.5 rounded-lg transition-colors ${post.pinned ? 'text-[#D4A820] bg-[#FBF0C8]' : 'text-[#9AB09A] hover:bg-[#F2E8D5] hover:text-[#D4A820]'}`}>
                                  {post.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                                </button>

                                {/* Fermer */}
                                <button onClick={() => { patchPost(post.id, { closed: !post.closed }); toast.success(post.closed ? 'Post réouvert' : 'Post fermé 🔒') }}
                                        title={post.closed ? 'Réouvrir' : 'Fermer les commentaires'}
                                        className={`p-1.5 rounded-lg transition-colors ${post.closed ? 'text-[#9AB09A] bg-[#F2E8D5]' : 'text-[#9AB09A] hover:bg-[#F2E8D5]'}`}>
                                  {post.closed ? <Unlock size={14} /> : <Lock size={14} />}
                                </button>

                                {/* Éditer */}
                                <button onClick={() => editingId === post.id ? setEditingId(null) : startEdit(post)}
                                        title="Modifier titre / catégorie"
                                        className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A] hover:text-[#1A3D2B]">
                                  <Pencil size={14} />
                                </button>

                                {/* Commentaires inline */}
                                <button onClick={() => setExpanded(expanded === post.id ? null : post.id)}
                                        title="Voir / gérer les commentaires"
                                        className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A]">
                                  {expanded === post.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {/* Supprimer */}
                                <button onClick={() => deletePost(post.id)} title="Supprimer"
                                        className="p-1.5 hover:bg-red-50 rounded-lg text-[#9AB09A] hover:text-red-500">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Commentaires inline dépliables */}
                          {expanded === post.id && (
                            <tr key={`${post.id}-exp`}>
                              <td colSpan={5} className="bg-[#F2E8D5]/50 border-b border-[#DBCAA8] px-6 py-4">
                                <PostCommentsInline postId={post.id} onRefresh={load} />
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ── COMMENTAIRES ── */}
          {tab === 'comments' && (
            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="bg-white border border-[#DBCAA8] rounded-xl p-10 text-center">
                  <p className="text-[#9AB09A]">Aucun commentaire en attente.</p>
                </div>
              ) : comments.map(c => (
                <div key={c.id} className="bg-white border border-[#DBCAA8] rounded-xl p-4 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#E8D9BF] border border-[#DBCAA8] flex items-center
                                  justify-center font-bold text-sm text-[#1A3D2B] flex-shrink-0">
                    {c.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-xs text-[#1A3D2B]">{c.authorName}</span>
                      <span className="text-[10px] text-[#9AB09A]">sur</span>
                      <Link href={`/forum/${c.post.category.slug}/${c.post.slug}`} target="_blank"
                            className="text-[10px] text-[#3A7A52] hover:underline truncate max-w-[200px]">
                        {c.post.title}
                      </Link>
                      {!c.approved && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-500">
                          En attente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#6B8C6A] line-clamp-2">{c.content}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!c.approved && (
                      <button onClick={() => { patchComment(c.id, { approved: true }); toast.success('Commentaire approuvé') }}
                              className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg
                                         bg-[rgba(58,122,82,0.1)] text-[#2D6A4F] hover:bg-[rgba(58,122,82,0.2)]">
                        <Check size={12} /> Approuver
                      </button>
                    )}
                    <button onClick={() => deleteComment(c.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-[#9AB09A] hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── SIGNALEMENTS ── */}
          {tab === 'reports' && (
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="bg-white border border-[#DBCAA8] rounded-xl p-10 text-center">
                  <Flag size={28} className="text-[#9AB09A] mx-auto mb-2" />
                  <p className="text-[#9AB09A]">Aucun signalement en attente. ✅</p>
                </div>
              ) : reports.map(r => (
                <div key={r.id} className="bg-white border border-[#DBCAA8] rounded-xl p-4 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={16} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-xs text-[#1A3D2B]">{REASON_LABELS[r.reason] ?? r.reason}</span>
                      <span className="text-[10px] text-[#9AB09A]">{formatDate(r.createdAt)}</span>
                    </div>
                    {r.post && (
                      <p className="text-xs text-[#6B8C6A] mb-1">
                        Post : <Link href={`/forum/${r.post.category.slug}/${r.post.slug}`} target="_blank"
                                     className="text-[#3A7A52] hover:underline">{r.post.title}</Link>
                      </p>
                    )}
                    {r.comment && (
                      <p className="text-xs text-[#6B8C6A] mb-1 line-clamp-2">
                        Commentaire de <strong>{r.comment.authorName}</strong> : « {r.comment.content} »
                      </p>
                    )}
                    {r.details && <p className="text-xs text-[#9AB09A] italic">Détails : {r.details}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => resolveReport(r.id, 'reviewed')}
                            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg
                                       bg-[rgba(58,122,82,0.1)] text-[#2D6A4F] hover:bg-[rgba(58,122,82,0.2)]">
                      <Check size={12} /> Traité
                    </button>
                    <button onClick={() => resolveReport(r.id, 'dismissed')}
                            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg
                                       bg-[#F2E8D5] text-[#9AB09A] hover:bg-[#DBCAA8]">
                      <X size={12} /> Ignorer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Commentaires inline d'un post (composant enfant)
function PostCommentsInline({ postId, onRefresh }: { postId: string; onRefresh: () => void }) {
  const [items, setItems] = useState<Array<{ id: string; authorName: string; content: string; approved: boolean }>>([])

  useEffect(() => {
    fetch(`/api/forum/comments?postId=${postId}`)
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [postId])

  async function del(id: string) {
    await fetch(`/api/forum/comments/${id}`, { method: 'DELETE' })
    setItems(p => p.filter(c => c.id !== id))
    onRefresh()
  }

  if (items.length === 0) return <p className="text-xs text-[#9AB09A] italic">Aucun commentaire.</p>

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-[#9AB09A] uppercase tracking-wide mb-2">
        {items.length} commentaire{items.length > 1 ? 's' : ''}
      </p>
      {items.map(c => (
        <div key={c.id} className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-[#DBCAA8]">
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-xs text-[#1A3D2B] mr-2">{c.authorName}</span>
            {!c.approved && (
              <span className="text-[9px] font-bold bg-orange-50 text-orange-400 px-1.5 py-0.5 rounded-full mr-2">
                Non approuvé
              </span>
            )}
            <span className="text-xs text-[#6B8C6A]">{c.content}</span>
          </div>
          <button onClick={() => del(c.id)} className="p-1 hover:bg-red-50 rounded text-[#9AB09A] hover:text-red-400 flex-shrink-0">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}
