import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import {
  FileText, RefreshCw, BookOpen, Calendar, Building2, Users, HelpCircle, MessageSquare,
  TrendingUp, ArrowRight, Eye
} from 'lucide-react'
import { formatRelative } from '@/lib/utils'

export const revalidate = 30

async function getDashboardData() {
  const [
    articleCount, changelogCount, guideCount, eventCount,
    cityCount, staffCount, faqCount, messageCount,
    recentArticles, recentMessages
  ] = await Promise.all([
    prisma.article.count({ where: { published: true } }),
    prisma.changelog.count({ where: { published: true } }),
    prisma.guide.count({ where: { published: true } }),
    prisma.event.count({ where: { published: true } }),
    prisma.city.count({ where: { published: true } }),
    prisma.staffMember.count({ where: { active: true } }),
    prisma.faqItem.count({ where: { published: true } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.article.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    }),
    prisma.contactMessage.findMany({
      take: 5,
      where: { read: false },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return {
    stats: { articleCount, changelogCount, guideCount, eventCount, cityCount, staffCount, faqCount, messageCount },
    recentArticles,
    recentMessages,
  }
}

export default async function AdminDashboard() {
  const { stats, recentArticles, recentMessages } = await getDashboardData()

  const STAT_CARDS = [
    { label: 'Articles publiés', value: stats.articleCount,   icon: <FileText size={20} />,    href: '/admin/articles',   color: 'text-blue-400' },
    { label: 'Changelogs',       value: stats.changelogCount, icon: <RefreshCw size={20} />,   href: '/admin/changelog',  color: 'text-green-400' },
    { label: 'Guides',           value: stats.guideCount,     icon: <BookOpen size={20} />,    href: '/admin/guides',     color: 'text-purple-400' },
    { label: 'Événements',       value: stats.eventCount,     icon: <Calendar size={20} />,    href: '/admin/evenements', color: 'text-yellow-400' },
    { label: 'Villes',           value: stats.cityCount,      icon: <Building2 size={20} />,   href: '/admin/villes',     color: 'text-emerald-400' },
    { label: 'Staff actif',      value: stats.staffCount,     icon: <Users size={20} />,       href: '/admin/staff',      color: 'text-pink-400' },
    { label: 'FAQ',              value: stats.faqCount,       icon: <HelpCircle size={20} />,  href: '/admin/faq',        color: 'text-cyan-400' },
    { label: 'Messages non lus', value: stats.messageCount,   icon: <MessageSquare size={20}/>, href: '/admin/messages', color: 'text-orange-400' },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Title */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[#E8F5EE] mb-1">Tableau de bord</h1>
        <p className="text-[#9DC4AD] text-sm">Vue d'ensemble de votre site Voilectia</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="card-hover p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className={`${card.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                  {card.icon}
                </div>
                <ArrowRight size={14} className="text-[#5A8A6A] group-hover:text-[#52B788] transition-colors" />
              </div>
              <div className="font-display font-bold text-2xl text-[#E8F5EE] mb-0.5">
                {card.value}
              </div>
              <div className="text-[#9DC4AD] text-xs">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent articles */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[#E8F5EE] text-sm">Articles récents</h2>
            <Link href="/admin/articles" className="text-xs text-[#52B788] hover:text-[#74C69D] flex items-center gap-1">
              Gérer <ArrowRight size={12} />
            </Link>
          </div>
          {recentArticles.length === 0 ? (
            <p className="text-[#5A8A6A] text-sm text-center py-4">Aucun article</p>
          ) : (
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <div key={article.id} className="flex items-center gap-3 group">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${article.published ? 'bg-[#52B788]' : 'bg-[#5A8A6A]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#E8F5EE] text-sm truncate">{article.title}</p>
                    <p className="text-[#5A8A6A] text-xs">{article.author.name} · {formatRelative(article.createdAt)}</p>
                  </div>
                  <Link href={`/admin/articles/${article.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye size={14} className="text-[#52B788]" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[#E8F5EE] text-sm flex items-center gap-2">
              Messages non lus
              {stats.messageCount > 0 && (
                <span className="badge-red text-[10px] px-1.5 py-0.5">{stats.messageCount}</span>
              )}
            </h2>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-[#5A8A6A] text-sm text-center py-4">Aucun message non lu</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#E8F5EE] text-sm truncate">{msg.name}</p>
                    <p className="text-[#9DC4AD] text-xs truncate">{msg.subject}</p>
                    <p className="text-[#5A8A6A] text-[10px]">{formatRelative(msg.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-5">
        <h2 className="font-display font-semibold text-[#E8F5EE] text-sm mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '+ Nouvel article',   href: '/admin/articles/new' },
            { label: '+ Nouveau changelog', href: '/admin/changelog/new' },
            { label: '+ Nouveau guide',    href: '/admin/guides/new' },
            { label: '+ Nouvel événement', href: '/admin/evenements/new' },
            { label: '+ Nouvelle ville',   href: '/admin/villes/new' },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="btn-primary text-xs px-3 py-1.5">
              {a.label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
