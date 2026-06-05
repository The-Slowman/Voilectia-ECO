import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { MessageSquare, Pin, Eye, Plus, ChevronLeft, ChevronRight, User, Lock } from 'lucide-react'

export const revalidate = 60

interface Props {
  params:       { category: string }
  searchParams: { sort?: string; page?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await prisma.forumCategory.findUnique({ where: { slug: params.category } })
  if (!cat) return { title: 'Catégorie introuvable' }
  return { title: `Forum — ${cat.name}`, description: cat.description ?? undefined }
}

const PAGE_SIZE = 20

export default async function ForumCategoryPage({ params, searchParams }: Props) {
  const category = await prisma.forumCategory.findUnique({ where: { slug: params.category } })
  if (!category) notFound()

  const sort  = searchParams.sort ?? 'recent'
  const page  = Math.max(1, parseInt(searchParams.page ?? '1'))

  const orderBy =
    sort === 'popular' ? [{ pinned: 'desc' as const }, { comments: { _count: 'desc' as const } }]
    : sort === 'views' ? [{ pinned: 'desc' as const }, { views: 'desc' as const }]
    :                    [{ pinned: 'desc' as const }, { createdAt: 'desc' as const }]

  const where = { categoryId: category.id, approved: true }

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where,
      orderBy,
      skip:    (page - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
      include: { _count: { select: { comments: { where: { approved: true } } } } },
    }),
    prisma.forumPost.count({ where }),
  ])

  const totalPages  = Math.ceil(total / PAGE_SIZE)
  const accentColor = category.color ?? '#3A7A52'

  function pageUrl(p: number) { return `/forum/${params.category}?sort=${sort}&page=${p}` }
  function sortUrl(s: string) { return `/forum/${params.category}?sort=${s}&page=1` }

  return (
    <div>
      {/* Héro catégorie */}
      <div className="relative bg-[#1A3D2B] pt-28 pb-14 overflow-hidden">
        <div className="absolute inset-0"
             style={{ background: `radial-gradient(ellipse at 50% 0%, ${accentColor}22 0%, transparent 60%)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-[3px]
                        bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/forum"
                className="inline-flex items-center gap-1.5 text-[rgba(242,232,213,0.5)]
                           hover:text-[#F2E8D5] text-xs mb-5 transition-colors">
            <ChevronLeft size={13} /> Retour au forum
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                 style={{ background: `${accentColor}25`, border: `1px solid ${accentColor}40` }}>
              {category.icon ?? '💬'}
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl text-[#F2E8D5] mb-1">{category.name}</h1>
              {category.description && (
                <p className="text-[rgba(242,232,213,0.5)] text-sm italic"
                   style={{ fontFamily: 'var(--font-lora)' }}>
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">

        {/* Actions + tri */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-[#6B8C6A] text-sm">{total} post{total !== 1 ? 's' : ''}</p>
            <div className="flex gap-1">
              {[
                { key: 'recent',  label: '🕐 Récent' },
                { key: 'popular', label: '💬 Populaire' },
                { key: 'views',   label: '👁️ Vues' },
              ].map(s => (
                <Link key={s.key} href={sortUrl(s.key)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        sort === s.key
                          ? 'text-white'
                          : 'bg-white border border-[#DBCAA8] text-[#6B8C6A] hover:border-[#9AB09A]'
                      }`}
                      style={sort === s.key ? { background: accentColor } : {}}>
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/forum/nouveau" className="btn-gold flex items-center gap-2 text-sm">
            <Plus size={15} /> Nouveau post
          </Link>
        </div>

        {/* Liste */}
        {posts.length === 0 ? (
          <div className="bg-white border border-[#DBCAA8] rounded-xl p-10 text-center">
            <MessageSquare size={32} className="text-[#9AB09A] mx-auto mb-3" />
            <p className="text-[#6B8C6A] mb-4">Soyez le premier à poster dans cette catégorie !</p>
            <Link href="/forum/nouveau" className="btn-primary flex items-center gap-2 mx-auto w-fit">
              <Plus size={15} /> Créer le premier post
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map(post => (
              <Link key={post.id} href={`/forum/${category.slug}/${post.slug}`}>
                <div className="bg-white border border-[#DBCAA8] rounded-xl px-5 py-4
                                hover:border-[#D4A820] hover:shadow-sm transition-all group flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold
                                  text-sm flex-shrink-0"
                       style={{ background: `${accentColor}15`, color: accentColor }}>
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {post.pinned && (
                        <span className="text-[9px] font-bold bg-[#FBF0C8] text-[#A07810]
                                         border border-[rgba(212,168,32,0.3)] px-1.5 py-0.5 rounded-full flex-shrink-0">
                          📌
                        </span>
                      )}
                      {post.closed && <Lock size={11} className="text-[#9AB09A] flex-shrink-0" title="Post fermé" />}
                      <h3 className="font-semibold text-sm text-[#1A3D2B]
                                     group-hover:text-[#2D6A4F] transition-colors truncate">
                        {post.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[#9AB09A]">
                      <span className="flex items-center gap-1"><User size={10} /> {post.authorName}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-5 text-xs text-[#9AB09A] flex-shrink-0">
                    <span className="flex items-center gap-1.5"><MessageSquare size={12} /> {post._count.comments}</span>
                    <span className="flex items-center gap-1.5"><Eye size={12} /> {post.views}</span>
                  </div>
                  <ChevronRight size={14} className="text-[#9AB09A] group-hover:text-[#1A3D2B] flex-shrink-0 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {page > 1 && (
              <Link href={pageUrl(page - 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#DBCAA8]
                               bg-white text-sm text-[#6B8C6A] hover:border-[#1A3D2B] transition-colors">
                <ChevronLeft size={14} /> Précédent
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<Array<number | '...'>>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === '...'
                  ? <span key={`e-${i}`} className="px-2 text-[#9AB09A]">…</span>
                  : (
                    <Link key={p} href={pageUrl(p as number)}
                          className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                            p === page ? 'text-white' : 'bg-white border border-[#DBCAA8] text-[#6B8C6A] hover:border-[#1A3D2B]'
                          }`}
                          style={p === page ? { background: accentColor } : {}}>
                      {p}
                    </Link>
                  )
              )
            }
            {page < totalPages && (
              <Link href={pageUrl(page + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#DBCAA8]
                               bg-white text-sm text-[#6B8C6A] hover:border-[#1A3D2B] transition-colors">
                Suivant <ChevronRight size={14} />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
