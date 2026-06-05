import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PageHero } from '@/components/ui/PageHero'
import { prisma } from '@/lib/db'
import { formatRelative } from '@/lib/utils'
import { MessageSquare, Pin, Eye, Plus, ChevronRight, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Forum',
  description: 'Forum communautaire Voilectia — tutoriels, astuces et discussions.',
}

export const revalidate = 60

export default async function ForumPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  // Redirection vers les résultats si recherche active
  const query = searchParams.q?.trim()
  if (query) {
    redirect(`/forum/recherche?q=${encodeURIComponent(query)}`)
  }

  const categories = await prisma.forumCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      posts: {
        where:   { approved: true },
        orderBy: { createdAt: 'desc' },
        take:    1,
        select:  { title: true, authorName: true, createdAt: true, slug: true },
      },
      _count: { select: { posts: { where: { approved: true } } } },
    },
  })

  // Posts épinglés toutes catégories
  const pinnedPosts = await prisma.forumPost.findMany({
    where:   { pinned: true, approved: true },
    orderBy: { createdAt: 'desc' },
    take:    3,
    include: { category: { select: { name: true, slug: true, color: true } } },
  })

  return (
    <div>
      <PageHero
        title="Forum"
        subtitle="Partagez vos tutoriels, astuces et discussions avec la communauté Voilectia."
        badge="💬 Communauté"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Barre de recherche + actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 py-8">
          <form method="GET" className="flex-1 flex items-center gap-2 bg-white border border-[#DBCAA8]
                                        rounded-xl px-4 py-2.5 focus-within:border-[#3A7A52] transition-colors">
            <Search size={15} className="text-[#9AB09A] flex-shrink-0" />
            <input
              name="q"
              type="search"
              placeholder="Rechercher dans le forum…"
              className="flex-1 text-sm bg-transparent outline-none text-[#1A3D2B] placeholder:text-[#9AB09A]"
            />
          </form>
          <p className="text-[#6B8C6A] text-sm hidden sm:block">
            {categories.reduce((acc, c) => acc + c._count.posts, 0)} messages
          </p>
          <Link href="/forum/nouveau" className="btn-gold flex items-center gap-2 flex-shrink-0">
            <Plus size={16} /> Nouveau post
          </Link>
        </div>

        {/* Posts épinglés */}
        {pinnedPosts.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display font-bold text-[#1A3D2B] text-lg mb-4 flex items-center gap-2">
              <Pin size={16} className="text-[#D4A820]" /> Épinglés
            </h2>
            <div className="space-y-2">
              {pinnedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/forum/${post.category.slug}/${post.slug}`}
                  className="flex items-center gap-3 bg-[#FBF0C8] border border-[rgba(212,168,32,0.3)]
                             rounded-xl px-5 py-3 hover:border-[#D4A820] transition-colors group"
                >
                  <Pin size={13} className="text-[#D4A820] flex-shrink-0" />
                  <span className="font-semibold text-sm text-[#1A3D2B] group-hover:text-[#2D6A4F] flex-1 truncate">
                    {post.title}
                  </span>
                  <span className="text-xs text-[#9AB09A]">{post.category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Catégories */}
        {categories.length === 0 ? (
          <div className="card p-10 text-center">
            <MessageSquare size={36} className="text-[#9AB09A] mx-auto mb-3" />
            <p className="text-[#6B8C6A]">Le forum ouvrira bientôt. Revenez plus tard !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat) => {
              const lastPost = cat.posts[0]
              const accentColor = cat.color ?? '#3A7A52'

              return (
                <Link key={cat.id} href={`/forum/${cat.slug}`}>
                  <div className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden
                                  hover:border-[#D4A820] hover:shadow-sm transition-all group
                                  flex"
                       style={{ borderLeft: `4px solid ${accentColor}` }}>

                    {/* Icône + infos */}
                    <div className="flex-1 p-5 flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center
                                   text-2xl flex-shrink-0"
                        style={{ background: `${accentColor}18` }}
                      >
                        {cat.icon ?? '💬'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-[#1A3D2B] text-base
                                       group-hover:text-[#2D6A4F] transition-colors mb-0.5">
                          {cat.name}
                        </h3>
                        {cat.description && (
                          <p className="text-[#6B8C6A] text-xs line-clamp-1">{cat.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-8 px-6 border-l border-[#DBCAA8]">
                      <div className="text-center">
                        <div className="font-display font-bold text-xl text-[#1A3D2B]">
                          {cat._count.posts}
                        </div>
                        <div className="text-[9px] text-[#9AB09A] uppercase tracking-wide">Posts</div>
                      </div>
                    </div>

                    {/* Dernier post */}
                    {lastPost && (
                      <div className="hidden lg:flex flex-col justify-center px-5 border-l border-[#DBCAA8]
                                      min-w-[200px] max-w-[220px]">
                        <p className="text-[10px] text-[#9AB09A] mb-0.5">Dernier message</p>
                        <p className="text-xs font-medium text-[#2D6A4F] line-clamp-1">{lastPost.title}</p>
                        <p className="text-[10px] text-[#9AB09A] mt-0.5">
                          {lastPost.authorName} · {formatRelative(lastPost.createdAt)}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center px-4">
                      <ChevronRight size={16} className="text-[#9AB09A] group-hover:text-[#1A3D2B] transition-colors" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Règles du forum */}
        <div className="mt-10 bg-[#F2E8D5] border border-[#DBCAA8] rounded-xl p-5">
          <h3 className="font-display font-bold text-[#1A3D2B] text-sm mb-3">📋 Règles du forum</h3>
          <ul className="space-y-1.5 text-xs text-[#6B8C6A]">
            {[
              'Restez respectueux et bienveillant envers tous les membres.',
              'Les posts sont soumis à modération avant d\'être publiés.',
              'Vérifiez qu\'un tutoriel similaire n\'existe pas avant de poster.',
              'Utilisez un titre clair et descriptif pour votre post.',
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#D4A820] font-bold flex-shrink-0">{i + 1}.</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
