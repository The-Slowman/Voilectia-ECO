'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Eye, Pin, PinOff, Lock, Unlock, Pencil, Trash2,
  MessageSquare, AlertTriangle, Plus, Check, X,
  ChevronDown, ChevronUp, Flag,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { AdminBadge } from '@/components/admin/AdminBadge'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

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
    setEditCat(categories.find(c => c.name === post.category.name)?.id ?? '')
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
    { key: 'posts',    label: 'Posts',        badge: pendingPosts    },
    { key: 'comments', label: 'Commentaires', badge: pendingComments },
    { key: 'reports',  label: 'Signalements', badge: pendingReports  },
  ] as const

  return (
    <div>
      {/* Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Forum</h1>
          <p className="adm-page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {pendingPosts > 0 && <AdminBadge variant="orange">{pendingPosts} en attente</AdminBadge>}
            {pendingReports > 0 && <AdminBadge variant="red">{pendingReports} signalement{pendingReports > 1 ? 's' : ''}</AdminBadge>}
            {posts.filter(p => p.approved).length} posts publiés
          </p>
        </div>
        <Link href="/admin/forum/categories" className="adm-btn adm-btn-ghost" style={{ textDecoration: 'none' }}>
          <Plus size={13} /> Catégories
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--adm-border)', marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
                  style={{
                    padding: '8px 14px', fontSize: 13, fontWeight: 500, border: 'none', background: 'none',
                    cursor: 'pointer', borderBottom: `2px solid ${tab === t.key ? 'var(--adm-accent)' : 'transparent'}`,
                    color: tab === t.key ? 'var(--adm-text-1)' : 'var(--adm-text-2)',
                    marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.12s',
                  }}>
            {t.label}
            {t.badge > 0 && (
              <span style={{
                background: t.key === 'reports' ? 'var(--adm-red-sub)' : 'var(--adm-orange-sub)',
                color:      t.key === 'reports' ? 'var(--adm-red)'     : 'var(--adm-orange)',
                fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 6px',
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => <div key={i} className="adm-skeleton" style={{ height: 44, borderRadius: 8 }} />)}
        </div>
      ) : (
        <>
          {/* ── POSTS ── */}
          {tab === 'posts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* En attente */}
              {pendingPosts > 0 && (
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--adm-orange)', display: 'inline-block' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--adm-text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      En attente de modération
                    </span>
                  </div>
                  <div className="adm-table-wrap" style={{ borderLeft: '2px solid var(--adm-orange)' }}>
                    <table className="adm-table">
                      <thead><tr><th>Titre</th><th>Auteur</th><th>Catégorie</th><th style={{ width: 160 }} /></tr></thead>
                      <tbody>
                        {posts.filter(p => !p.approved).map(post => (
                          <tr key={post.id}>
                            <td style={{ fontWeight: 500, color: 'var(--adm-text-1)' }}>{post.title}</td>
                            <td style={{ color: 'var(--adm-text-2)' }}>{post.authorName}</td>
                            <td>
                              <span className="adm-badge" style={{ background: `${post.category.color ?? 'var(--adm-accent)'}20`, color: post.category.color ?? 'var(--adm-accent)' }}>
                                {post.category.name}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button onClick={() => { patchPost(post.id, { approved: true }); toast.success('Approuvé') }}
                                        className="adm-btn adm-btn-primary adm-btn-sm">
                                  <Check size={12} /> Approuver
                                </button>
                                <button onClick={() => deletePost(post.id)} className="adm-btn adm-btn-danger adm-btn-sm">
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
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--adm-text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Posts publiés ({posts.filter(p => p.approved).length})
                </div>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Titre</th>
                        <th>Auteur</th>
                        <th>Catégorie</th>
                        <th>Stats</th>
                        <th style={{ width: 140 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {posts.filter(p => p.approved).map(post => (
                        <>
                          <tr key={post.id} style={{ opacity: post.closed ? 0.65 : 1 }}>
                            <td>
                              {editingId === post.id ? (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                  <input className="adm-input" style={{ minWidth: 130, flex: 1, fontSize: 12 }}
                                         value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                         onKeyDown={e => e.key === 'Enter' && saveEdit(post.id)} autoFocus />
                                  <select className="adm-input" style={{ width: 120, fontSize: 12 }}
                                          value={editCat} onChange={e => setEditCat(e.target.value)}>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  </select>
                                  <button onClick={() => saveEdit(post.id)} className="adm-btn adm-btn-primary adm-btn-sm"><Check size={12} /></button>
                                  <button onClick={() => setEditingId(null)} className="adm-btn adm-btn-ghost adm-btn-sm"><X size={12} /></button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  {post.pinned && <Pin size={10} style={{ color: 'var(--adm-gold)', flexShrink: 0 }} />}
                                  {post.closed && <Lock size={10} style={{ color: 'var(--adm-text-3)', flexShrink: 0 }} />}
                                  <span style={{ fontWeight: 500, color: 'var(--adm-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{post.title}</span>
                                </div>
                              )}
                            </td>
                            <td style={{ color: 'var(--adm-text-2)' }}>{post.authorName}</td>
                            <td>
                              <span className="adm-badge" style={{ background: `${post.category.color ?? 'var(--adm-accent)'}20`, color: post.category.color ?? 'var(--adm-accent)' }}>
                                {post.category.name}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--adm-text-3)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10} />{post.views}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MessageSquare size={10} />{post._count.comments}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                                <button onClick={() => { patchPost(post.id, { pinned: !post.pinned }); toast.success(post.pinned ? 'Dépinglé' : 'Épinglé 📌') }}
                                        className="adm-btn adm-btn-ghost adm-btn-sm" title={post.pinned ? 'Dépingler' : 'Épingler'}
                                        style={post.pinned ? { color: 'var(--adm-gold)' } : {}}>
                                  {post.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                                </button>
                                <button onClick={() => { patchPost(post.id, { closed: !post.closed }); toast.success(post.closed ? 'Réouvert' : 'Fermé 🔒') }}
                                        className="adm-btn adm-btn-ghost adm-btn-sm" title={post.closed ? 'Réouvrir' : 'Fermer'}>
                                  {post.closed ? <Unlock size={13} /> : <Lock size={13} />}
                                </button>
                                <button onClick={() => editingId === post.id ? setEditingId(null) : startEdit(post)}
                                        className="adm-btn adm-btn-ghost adm-btn-sm">
                                  <Pencil size={13} />
                                </button>
                                <button onClick={() => setExpanded(expanded === post.id ? null : post.id)}
                                        className="adm-btn adm-btn-ghost adm-btn-sm">
                                  {expanded === post.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                </button>
                                <button onClick={() => deletePost(post.id)} className="adm-btn adm-btn-danger adm-btn-sm">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expanded === post.id && (
                            <tr key={`${post.id}-exp`}>
                              <td colSpan={5} style={{ background: 'var(--adm-surface-2)', padding: '12px 16px' }}>
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
            comments.length === 0 ? (
              <AdminEmptyState icon="💬" title="Aucun commentaire en attente" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {comments.map(c => (
                  <div key={c.id} className="adm-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: 'var(--adm-surface-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: 'var(--adm-accent)', flexShrink: 0,
                    }}>
                      {c.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--adm-text-1)' }}>{c.authorName}</span>
                        <span style={{ fontSize: 11, color: 'var(--adm-text-3)' }}>sur</span>
                        <Link href={`/forum/${c.post.category.slug}/${c.post.slug}`} target="_blank"
                              style={{ fontSize: 11, color: 'var(--adm-accent)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                          {c.post.title}
                        </Link>
                        {!c.approved && <AdminBadge variant="orange">En attente</AdminBadge>}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--adm-text-2)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{c.content}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {!c.approved && (
                        <button onClick={() => { patchComment(c.id, { approved: true }); toast.success('Approuvé') }}
                                className="adm-btn adm-btn-primary adm-btn-sm">
                          <Check size={12} /> Approuver
                        </button>
                      )}
                      <button onClick={() => deleteComment(c.id)} className="adm-btn adm-btn-danger adm-btn-sm">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── SIGNALEMENTS ── */}
          {tab === 'reports' && (
            reports.length === 0 ? (
              <AdminEmptyState icon="✅" title="Aucun signalement en attente" desc="Tout est calme côté modération." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {reports.map(r => (
                  <div key={r.id} className="adm-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 12, borderLeft: '2px solid var(--adm-red)' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 6, background: 'var(--adm-red-sub)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <AlertTriangle size={14} style={{ color: 'var(--adm-red)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--adm-text-1)' }}>{REASON_LABELS[r.reason] ?? r.reason}</span>
                        <span style={{ fontSize: 11, color: 'var(--adm-text-3)' }}>{formatDate(r.createdAt)}</span>
                      </div>
                      {r.post && (
                        <p style={{ fontSize: 12, color: 'var(--adm-text-2)', marginBottom: 2 }}>
                          Post : <Link href={`/forum/${r.post.category.slug}/${r.post.slug}`} target="_blank"
                                       style={{ color: 'var(--adm-accent)', textDecoration: 'none' }}>{r.post.title}</Link>
                        </p>
                      )}
                      {r.comment && (
                        <p style={{ fontSize: 12, color: 'var(--adm-text-2)', marginBottom: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          Commentaire de <strong>{r.comment.authorName}</strong> : « {r.comment.content} »
                        </p>
                      )}
                      {r.details && <p style={{ fontSize: 11, color: 'var(--adm-text-3)', fontStyle: 'italic' }}>Détails : {r.details}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => resolveReport(r.id, 'reviewed')} className="adm-btn adm-btn-primary adm-btn-sm">
                        <Check size={12} /> Traité
                      </button>
                      <button onClick={() => resolveReport(r.id, 'dismissed')} className="adm-btn adm-btn-ghost adm-btn-sm">
                        <X size={12} /> Ignorer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}

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

  if (items.length === 0) return (
    <p style={{ fontSize: 12, color: 'var(--adm-text-3)', fontStyle: 'italic' }}>Aucun commentaire.</p>
  )

  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--adm-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        {items.length} commentaire{items.length > 1 ? 's' : ''}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(c => (
          <div key={c.id} className="adm-card" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--adm-text-1)', marginRight: 6 }}>{c.authorName}</span>
              {!c.approved && <AdminBadge variant="orange">Non approuvé</AdminBadge>}
              <span style={{ fontSize: 12, color: 'var(--adm-text-2)', marginLeft: 4 }}>{c.content}</span>
            </div>
            <button onClick={() => del(c.id)} className="adm-btn adm-btn-danger adm-btn-sm" style={{ flexShrink: 0 }}>
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
