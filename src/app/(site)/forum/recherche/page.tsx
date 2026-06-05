import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { Search, MessageSquare, Eye, ChevronLeft, Pin, Lock } from 'lucide-react'

export const metadata: Metadata = { title: 'Recherche — Forum' }

interface Props { searchParams: { q?: string; sort?: string } }

export default async function ForumSearchPage({ searchParams }: Props) {
  const q    = searchParams.q?.trim() ?? ''
  const sort = searchParams.sort ?? 'recent'

  const posts = q ? await prisma.forumPost.findMany({
    where: {
      approved: true,
      OR: [
        { title:      { contains: q } },
        { authorName: { contains: q } },
        { excerpt:    { contains: q } },
      ],
    },
    orderBy: sort === 'popular' ? [{ comments: { _count: 'desc' } }]
            : sort === 'views'  ? [{ views: 'desc' }]
            :                     [{ createdAt: 'desc' }],
    take: 30,
    include: {
      category: { select: { name: true, slug: true, color: true, icon: true } },
      _count:   { select: { comments: { where: { approved: true } } } },
    },
  }) : []

  return (
    <div className="bg-[#F2E8D5] min-h-screen">
      <div className="bg-[#1A3D2B] pt-24 pb-12 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px]
                        bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/forum"
                className="inline-flex items-center gap-1.5 text-[rgba(242,232,213,0.5)]
                           hover:text-[#F2E8D5] text-xs mb-5 transition-colors">
            <ChevronLeft size={13} /> Retour au forum
          </Link>
          {/* Barre de recherche */}
          <form method="GET" className="flex gap-2">
            <div className="flex-1 flex items-center gap-3 bg-white/10 border border-white/20
                            rounded-xl px-4 py-3 focus-within:bg-white/15 transition-colors">
              <Search size={16} className="text-[rgba(242,232,213,0.5)] flex-shrink-0" />
              <input
                name="q"
                defaultValue={q}
                type="search"
                placeholder="Rechercher dans le forum…"
                className="flex-1 bg-transparent outline-none text-[#F2E8D5] placeholder:text-[rgba(242,232,213,0.4)] text-sm"
                autoFocus
              />
            </div>
            <button type="submit"
                    className="px-5 py-3 bg-[#D4A820] hover:bg-[#B8901C] text-[#1A3D2B] font-bold
                               text-sm rounded-xl transition-colors">
              Rechercher
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-20">
        {q && (
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <p className="text-[#6B8C6A] text-sm">
              <strong className="text-[#1A3D2B]">{posts.length}</strong> résultat{posts.length !== 1 ? 's' : ''}
              {' '}pour <strong className="text-[#1A3D2B]">« {q} »</strong>
            </p>
            {/* Tri */}
            <div className="flex gap-1">
              {[
                { key: 'recent',  label: 'Récent' },
                { key: 'popular', label: 'Populaire' },
                { key: 'views',   label: 'Vues' },
              ].map(s => (
                <Link key={s.key}
                      href={`/forum/recherche?q=${encodeURIComponent(q)}&sort=${s.key}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        sort === s.key
                          ? 'bg-[#1A3D2B] text-[#F2E8D5]'
                          : 'bg-white border border-[#DBCAA8] text-[#6B8C6A] hover:border-[#1A3D2B]'
                      }`}>
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {!q ? (
          <div className="bg-white border border-[#DBCAA8] rounded-xl p-14 text-center">
            <Search size={36} className="text-[#9AB09A] mx-auto mb-3" />
            <p className="text-[#6B8C6A]">Entrez un mot-clé pour rechercher dans le forum.</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-[#DBCAA8] rounded-xl p-14 text-center">
            <Search size={36} className="text-[#9AB09A] mx-auto mb-3" />
            <p className="text-[#6B8C6A] mb-3">Aucun résultat pour « {q} ».</p>
            <Link href="/forum/nouveau" className="btn-primary text-sm">Créer un nouveau post</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map(post => (
              <Link key={post.id} href={`/forum/${post.category.slug}/${post.slug}`}>
                <div className="bg-white border border-[#DBCAA8] rounded-xl px-5 py-4
                                hover:border-[#D4A820] hover:shadow-sm transition-all group flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                       style={{ background: `${post.category.color ?? '#3A7A52'}15` }}>
                    {post.category.icon ?? '💬'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {post.pinned && <Pin size={11} className="text-[#D4A820] flex-shrink-0" />}
                      {(post as { closed?: boolean }).closed && <Lock size={11} className="text-[#9AB09A] flex-shrink-0" />}
                      <h3 className="font-semibold text-sm text-[#1A3D2B] group-hover:text-[#2D6A4F]
                                     transition-colors truncate">
                        {post.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[#9AB09A]">
                      <span className="font-bold" style={{ color: post.category.color ?? '#3A7A52' }}>
                        {post.category.name}
                      </span>
                      <span>par {post.authorName}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-[#9AB09A] flex-shrink-0">
                    <span className="flex items-center gap-1"><MessageSquare size={12} />{post._count.comments}</span>
                    <span className="flex items-center gap-1"><Eye size={12} />{post.views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
