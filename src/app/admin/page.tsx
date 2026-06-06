import { prisma } from '@/lib/db'
import Link from 'next/link'
import {
  FileText, RefreshCw, BookOpen, Calendar, Building2, Users, HelpCircle, MessageSquare,
  ArrowRight, Eye, Shield, Briefcase, TrendingUp, Gift, Server, AlertTriangle, Star
} from 'lucide-react'
import { formatRelative } from '@/lib/utils'

export const revalidate = 30

async function getDashboardData() {
  const [
    articleCount, changelogCount, guideCount, eventCount,
    cityCount, staffCount, faqCount, messageCount,
    playerCount, suggestionCount, forumPostCount,
    recentArticles, recentMessages, recentPlayers
  ] = await Promise.all([
    prisma.article.count({ where: { published: true } }),
    prisma.changelog.count({ where: { published: true } }),
    prisma.guide.count({ where: { published: true } }),
    prisma.event.count({ where: { published: true } }),
    prisma.city.count({ where: { published: true } }),
    prisma.staffMember.count({ where: { active: true } }),
    prisma.faqItem.count({ where: { published: true } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.user.count({ where: { role: 'PLAYER' } }),
    prisma.suggestion.count({ where: { status: 'pending' } }),
    prisma.forumPost.count({ where: { approved: true } }),
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
    prisma.user.findMany({
      take: 5,
      where: { role: 'PLAYER' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, createdAt: true, lastLoginAt: true, job: { select: { name: true, icon: true } } },
    }),
  ])

  return {
    stats: {
      articleCount, changelogCount, guideCount, eventCount,
      cityCount, staffCount, faqCount, messageCount,
      playerCount, suggestionCount, forumPostCount,
    },
    recentArticles,
    recentMessages,
    recentPlayers,
  }
}

export default async function AdminDashboard() {
  const { stats, recentArticles, recentMessages, recentPlayers } = await getDashboardData()

  const PRIMARY_STATS = [
    { label: 'Joueurs inscrits',   value: stats.playerCount,     icon: <Users size={20} />,       href: '/admin/membres',   color: 'text-emerald-400',  bg: 'bg-emerald-400/10' },
    { label: 'Articles publiés',   value: stats.articleCount,    icon: <FileText size={20} />,    href: '/admin/articles',  color: 'text-blue-400',     bg: 'bg-blue-400/10' },
    { label: 'Sujets forum',       value: stats.forumPostCount,  icon: <MessageSquare size={20}/>, href: '/admin/forum',    color: 'text-violet-400',   bg: 'bg-violet-400/10' },
    { label: 'Villes actives',     value: stats.cityCount,       icon: <Building2 size={20} />,   href: '/admin/villes',   color: 'text-cyan-400',     bg: 'bg-cyan-400/10' },
  ]
  const SECONDARY_STATS = [
    { label: 'Changelogs',           value: stats.changelogCount,  icon: <RefreshCw size={18} />,  href: '/admin/changelog',    color: 'text-green-400' },
    { label: 'Guides',               value: stats.guideCount,      icon: <BookOpen size={18} />,   href: '/admin/guides',       color: 'text-purple-400' },
    { label: 'Événements',           value: stats.eventCount,      icon: <Calendar size={18} />,   href: '/admin/evenements',   color: 'text-yellow-400' },
    { label: 'Staff actif',          value: stats.staffCount,      icon: <Shield size={18} />,     href: '/admin/staff',        color: 'text-pink-400' },
    { label: 'FAQ',                  value: stats.faqCount,        icon: <HelpCircle size={18} />, href: '/admin/faq',          color: 'text-cyan-400' },
    { label: 'Suggestions en att.', value: stats.suggestionCount, icon: <Star size={18} />,       href: '/admin/suggestions',  color: 'text-orange-400' },
    { label: 'Messages non lus',     value: stats.messageCount,    icon: <MessageSquare size={18}/>, href: '/admin/messages',   color: 'text-red-400' },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      <div>
        <h1 className="font-display text-2xl font-bold text-[#E8F5EE] mb-1">Tableau de bord</h1>
        <p className="text-[#9DC4AD] text-sm">Vue d'ensemble de Voilectia ECO</p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PRIMARY_STATS.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="card-hover p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <ArrowRight size={14} className="text-[#5A8A6A] group-hover:text-[#52B788] transition-colors" />
              </div>
              <div className="font-display font-bold text-3xl text-[#E8F5EE] mb-0.5">
                {card.value}
              </div>
              <div className="text-[#9DC4AD] text-xs">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {SECONDARY_STATS.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="card p-4 text-center hover:border-[rgba(82,183,136,0.3)] transition-colors group">
              <div className={`${s.color} flex justify-center mb-2 group-hover:scale-110 transition-transform`}>{s.icon}</div>
              <div className="font-bold text-xl text-[#E8F5EE]">{s.value}</div>
              <div className="text-[#5A8A6A] text-[10px] mt-0.5 leading-tight">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Ligne 3 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Derniers joueurs inscrits */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[#E8F5EE] text-sm flex items-center gap-2">
              <Users size={14} className="text-emerald-400" /> Derniers inscrits
            </h2>
            <Link href="/admin/membres" className="text-xs text-[#52B788] hover:text-[#74C69D] flex items-center gap-1">
              Gérer <ArrowRight size={12} />
            </Link>
          </div>
          {recentPlayers.length === 0 ? (
            <p className="text-[#5A8A6A] text-sm text-center py-4">Aucun joueur</p>
          ) : (
            <div className="space-y-3">
              {recentPlayers.map((p) => (
                <div key={p.id} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[rgba(82,183,136,0.1)] flex items-center justify-center text-[#52B788] text-xs font-bold flex-shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#E8F5EE] text-xs font-medium truncate">{p.name}</p>
                    <p className="text-[#5A8A6A] text-[10px]">
                      {p.job ? `${p.job.icon} ${p.job.name} · ` : ''}
                      {formatRelative(p.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Articles récents */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[#E8F5EE] text-sm flex items-center gap-2">
              <FileText size={14} className="text-blue-400" /> Articles récents
            </h2>
            <Link href="/admin/articles" className="text-xs text-[#52B788] hover:text-[#74C69D] flex items-center gap-1">
              Gérer <ArrowRight size={12} />
            </Link>
          </div>
          {recentArticles.length === 0 ? (
            <p className="text-[#5A8A6A] text-sm text-center py-4">Aucun article</p>
          ) : (
            <div className="space-y-3">
              {recentArticles.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5 group">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.published ? 'bg-[#52B788]' : 'bg-[#5A8A6A]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#E8F5EE] text-xs truncate">{a.title}</p>
                    <p className="text-[#5A8A6A] text-[10px]">{a.author.name} · {formatRelative(a.createdAt)}</p>
                  </div>
                  <Link href={`/admin/articles/${a.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye size={12} className="text-[#52B788]" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages non lus */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[#E8F5EE] text-sm flex items-center gap-2">
              <MessageSquare size={14} className="text-orange-400" /> Messages
              {stats.messageCount > 0 && (
                <span className="badge-red text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                  {stats.messageCount}
                </span>
              )}
            </h2>
            <Link href="/admin/messages" className="text-xs text-[#52B788] hover:text-[#74C69D] flex items-center gap-1">
              Voir tous <ArrowRight size={12} />
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-[#5A8A6A] text-sm text-center py-4">Aucun message</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#E8F5EE] text-xs font-medium truncate">{msg.name}</p>
                    <p className="text-[#9DC4AD] text-[10px] truncate">{msg.subject}</p>
                    <p className="text-[#5A8A6A] text-[10px]">{formatRelative(msg.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="card p-5">
        <h2 className="font-display font-semibold text-[#E8F5EE] text-sm mb-4 flex items-center gap-2">
          <TrendingUp size={14} className="text-[#52B788]" /> Actions rapides
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '+ Nouvel article',     href: '/admin/articles/new',    icon: <FileText size={12} /> },
            { label: '+ Nouveau changelog',  href: '/admin/changelog',       icon: <RefreshCw size={12} /> },
            { label: '+ Nouveau guide',      href: '/admin/guides',          icon: <BookOpen size={12} /> },
            { label: '+ Nouvel événement',   href: '/admin/evenements',      icon: <Calendar size={12} /> },
            { label: '+ Nouvelle ville',     href: '/admin/villes',          icon: <Building2 size={12} /> },
            { label: '+ Giveaway',           href: '/admin/giveaways',       icon: <Gift size={12} /> },
            { label: '⚙️ Config serveur',    href: '/admin/serveur',         icon: <Server size={12} /> },
            { label: '📋 Progression',       href: '/admin/progression',     icon: <Briefcase size={12} /> },
          ].map((a) => (
            <Link key={a.href} href={a.href}
                  className="inline-flex items-center gap-1.5 bg-[rgba(82,183,136,0.06)] border border-[rgba(82,183,136,0.12)] text-[#9DC4AD] hover:text-[#52B788] hover:border-[rgba(82,183,136,0.3)] px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
              {a.icon} {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Alertes */}
      {(stats.messageCount > 0 || stats.suggestionCount > 0) && (
        <div className="card p-4 border-orange-500/20 bg-orange-500/5">
          <h2 className="font-semibold text-[#E8F5EE] text-sm mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-orange-400" /> En attente
          </h2>
          <div className="flex flex-wrap gap-3">
            {stats.messageCount > 0 && (
              <Link href="/admin/messages" className="flex items-center gap-2 text-xs text-orange-300 hover:text-orange-200">
                <MessageSquare size={12} />
                {stats.messageCount} message{stats.messageCount > 1 ? 's' : ''} non lu{stats.messageCount > 1 ? 's' : ''}
              </Link>
            )}
            {stats.suggestionCount > 0 && (
              <Link href="/admin/suggestions" className="flex items-center gap-2 text-xs text-orange-300 hover:text-orange-200">
                <Star size={12} />
                {stats.suggestionCount} suggestion{stats.suggestionCount > 1 ? 's' : ''} en attente
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
