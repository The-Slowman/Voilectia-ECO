import { prisma } from '@/lib/db'
import Link from 'next/link'
import {
  Users, FileText, RefreshCw, BookOpen, Building2, MessageSquare,
  Lightbulb, Gift, ArrowUpRight, ArrowRight, TrendingUp,
  Calendar, Shield, HelpCircle, Mail, AlertTriangle,
} from 'lucide-react'
import { formatRelative } from '@/lib/utils'

export const revalidate = 30

async function getDashboardData() {
  const [
    playerCount, articleCount, changelogCount, guideCount,
    cityCount, staffCount, faqCount, messageCount,
    suggestionCount, forumPostCount, giveawayCount, eventCount,
    recentArticles, recentMessages, recentPlayers, pendingForumPosts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'PLAYER' } }),
    prisma.article.count({ where: { published: true } }),
    prisma.changelog.count({ where: { published: true } }),
    prisma.guide.count({ where: { published: true } }),
    prisma.city.count({ where: { published: true } }),
    prisma.staffMember.count({ where: { active: true } }),
    prisma.faqItem.count({ where: { published: true } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.suggestion.count({ where: { status: 'pending' } }),
    prisma.forumPost.count({ where: { approved: true } }),
    prisma.giveaway.count({ where: { status: 'active' } }),
    prisma.event.count({ where: { published: true } }),
    prisma.article.findMany({
      take: 4, orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    }),
    prisma.contactMessage.findMany({
      take: 4, where: { read: false }, orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      take: 5, where: { role: 'PLAYER' }, orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, createdAt: true, lastLoginAt: true },
    }),
    prisma.forumPost.count({ where: { approved: false } }),
  ])

  return {
    stats: {
      playerCount, articleCount, changelogCount, guideCount,
      cityCount, staffCount, faqCount, messageCount,
      suggestionCount, forumPostCount, giveawayCount, eventCount,
      pendingForumPosts,
    },
    recentArticles, recentMessages, recentPlayers,
  }
}

/* ── Stat card component ──────────────────────────────── */
function StatCard({
  label, value, icon, href, color, bg,
  badge,
}: {
  label: string; value: number; icon: React.ReactNode
  href: string; color: string; bg: string; badge?: number
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div className="adm-stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
            {icon}
          </div>
          <ArrowUpRight size={13} style={{ color: 'var(--adm-text-3)' }} />
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--adm-text-1)', lineHeight: 1, marginBottom: 4 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--adm-text-2)' }}>{label}</div>
        {badge !== undefined && badge > 0 && (
          <span style={{
            position: 'absolute', top: 10, right: 10,
            background: 'var(--adm-red)', color: '#fff',
            fontSize: 10, fontWeight: 700, borderRadius: '99px',
            padding: '2px 6px', lineHeight: 1.4,
          }}>
            {badge}
          </span>
        )}
      </div>
    </Link>
  )
}

/* ── Mini stat ────────────────────────────────────────── */
function MiniStat({ label, value, icon, href, color }: {
  label: string; value: number; icon: React.ReactNode; href: string; color: string
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--adm-surface)', border: '1px solid var(--adm-border)',
        borderRadius: 8, padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--adm-accent)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--adm-border)')}
      >
        <div style={{ color, flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--adm-text-1)', lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 11, color: 'var(--adm-text-3)', marginTop: 2, lineHeight: 1 }}>{label}</div>
        </div>
      </div>
    </Link>
  )
}

export default async function AdminDashboard() {
  const { stats, recentArticles, recentMessages, recentPlayers } = await getDashboardData()

  const hasAlerts = stats.messageCount > 0 || stats.suggestionCount > 0 || stats.pendingForumPosts > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Page header */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--adm-text-1)', lineHeight: 1.2, marginBottom: 4 }}>
          Tableau de bord
        </h1>
        <p style={{ fontSize: 13, color: 'var(--adm-text-2)' }}>
          Vue d'ensemble de Voilectia ECO
        </p>
      </div>

      {/* Alertes */}
      {hasAlerts && (
        <div style={{
          background: 'var(--adm-orange-sub)', border: '1px solid var(--adm-orange)',
          borderRadius: 8, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <AlertTriangle size={14} style={{ color: 'var(--adm-orange)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-orange)' }}>
            En attente de traitement :
          </span>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {stats.messageCount > 0 && (
              <Link href="/admin/messages" style={{ fontSize: 12, color: 'var(--adm-text-1)', textDecoration: 'none' }}>
                📩 {stats.messageCount} message{stats.messageCount > 1 ? 's' : ''} non lu{stats.messageCount > 1 ? 's' : ''}
              </Link>
            )}
            {stats.suggestionCount > 0 && (
              <Link href="/admin/suggestions" style={{ fontSize: 12, color: 'var(--adm-text-1)', textDecoration: 'none' }}>
                💡 {stats.suggestionCount} suggestion{stats.suggestionCount > 1 ? 's' : ''} en attente
              </Link>
            )}
            {stats.pendingForumPosts > 0 && (
              <Link href="/admin/forum" style={{ fontSize: 12, color: 'var(--adm-text-1)', textDecoration: 'none' }}>
                💬 {stats.pendingForumPosts} post{stats.pendingForumPosts > 1 ? 's' : ''} forum à modérer
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stat cards principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        <StatCard label="Joueurs inscrits" value={stats.playerCount}    icon={<Users size={18} />}         href="/admin/membres"  color="var(--adm-accent)" bg="var(--adm-accent-sub)" badge={undefined} />
        <StatCard label="Articles publiés" value={stats.articleCount}   icon={<FileText size={18} />}      href="/admin/articles" color="var(--adm-blue)"   bg="var(--adm-blue-sub)" />
        <StatCard label="Villes actives"   value={stats.cityCount}      icon={<Building2 size={18} />}     href="/admin/villes"   color="var(--adm-cyan)"   bg="var(--adm-cyan-sub)" />
        <StatCard label="Sujets forum"     value={stats.forumPostCount} icon={<MessageSquare size={18} />} href="/admin/forum"    color="var(--adm-purple)" bg="var(--adm-purple-sub)" badge={stats.pendingForumPosts} />
        <StatCard label="Messages non lus" value={stats.messageCount}   icon={<Mail size={18} />}          href="/admin/messages" color="var(--adm-red)"    bg="var(--adm-red-sub)"  badge={stats.messageCount} />
        <StatCard label="Suggestions"      value={stats.suggestionCount}icon={<Lightbulb size={18} />}    href="/admin/suggestions" color="var(--adm-gold)" bg="var(--adm-gold-sub)" badge={stats.suggestionCount} />
      </div>

      {/* Mini stats secondaires */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
        <MiniStat label="Changelogs"   value={stats.changelogCount} icon={<RefreshCw size={14} />}    href="/admin/changelog"   color="var(--adm-accent)" />
        <MiniStat label="Guides"       value={stats.guideCount}     icon={<BookOpen size={14} />}     href="/admin/guides"       color="var(--adm-blue)" />
        <MiniStat label="Événements"   value={stats.eventCount}     icon={<Calendar size={14} />}     href="/admin/evenements"   color="var(--adm-gold)" />
        <MiniStat label="Staff actif"  value={stats.staffCount}     icon={<Shield size={14} />}       href="/admin/staff"        color="var(--adm-red)" />
        <MiniStat label="FAQ"          value={stats.faqCount}       icon={<HelpCircle size={14} />}   href="/admin/faq"          color="var(--adm-purple)" />
        <MiniStat label="Giveaways"    value={stats.giveawayCount}  icon={<Gift size={14} />}         href="/admin/giveaways"    color="var(--adm-orange)" />
      </div>

      {/* 3 colonnes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>

        {/* Derniers inscrits */}
        <div className="adm-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Users size={13} style={{ color: 'var(--adm-accent)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-text-1)' }}>Derniers inscrits</span>
            </div>
            <Link href="/admin/membres" style={{ fontSize: 11, color: 'var(--adm-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              Voir tous <ArrowRight size={11} />
            </Link>
          </div>
          {recentPlayers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--adm-text-3)', fontSize: 12 }}>
              Aucun joueur inscrit
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentPlayers.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 5,
                    background: 'var(--adm-accent-sub)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'var(--adm-accent)',
                    flexShrink: 0,
                  }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--adm-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--adm-text-3)' }}>{formatRelative(p.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Articles récents */}
        <div className="adm-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <FileText size={13} style={{ color: 'var(--adm-blue)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-text-1)' }}>Articles récents</span>
            </div>
            <Link href="/admin/articles" style={{ fontSize: 11, color: 'var(--adm-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              Gérer <ArrowRight size={11} />
            </Link>
          </div>
          {recentArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--adm-text-3)', fontSize: 12 }}>
              Aucun article
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentArticles.map((a) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: a.published ? 'var(--adm-accent)' : 'var(--adm-text-3)',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--adm-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--adm-text-3)' }}>
                      {a.author.name} · {formatRelative(a.createdAt)}
                    </div>
                  </div>
                  <Link href={`/admin/articles/${a.id}`} style={{ color: 'var(--adm-text-3)', flexShrink: 0, lineHeight: 0 }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--adm-accent)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--adm-text-3)')}>
                    <ArrowUpRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages non lus */}
        <div className="adm-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Mail size={13} style={{ color: 'var(--adm-red)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-text-1)' }}>
                Messages
                {stats.messageCount > 0 && (
                  <span style={{ marginLeft: 6, background: 'var(--adm-red)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: '99px', padding: '2px 6px' }}>
                    {stats.messageCount}
                  </span>
                )}
              </span>
            </div>
            <Link href="/admin/messages" style={{ fontSize: 11, color: 'var(--adm-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              Voir tous <ArrowRight size={11} />
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--adm-text-3)', fontSize: 12 }}>
              Aucun message non lu ✅
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentMessages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--adm-orange)', flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--adm-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--adm-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.subject}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--adm-text-3)' }}>{formatRelative(msg.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="adm-card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-text-1)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
          <TrendingUp size={13} style={{ color: 'var(--adm-accent)' }} />
          Actions rapides
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: '+ Nouvel article',     href: '/admin/articles/new',    emoji: '📰' },
            { label: '+ Nouveau changelog',  href: '/admin/changelog',       emoji: '📜' },
            { label: '+ Nouveau guide',      href: '/admin/guides',          emoji: '📚' },
            { label: '+ Nouvelle ville',     href: '/admin/villes/nouveau',  emoji: '🏘️' },
            { label: '+ Nouvel événement',   href: '/admin/evenements',      emoji: '🎉' },
            { label: '+ Giveaway',           href: '/admin/giveaways',       emoji: '🎁' },
            { label: '+ Page CMS',           href: '/admin/contenus',        emoji: '📄' },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--adm-surface-2)', border: '1px solid var(--adm-border)',
                color: 'var(--adm-text-2)', borderRadius: 6,
                fontSize: 12, fontWeight: 500, padding: '5px 12px',
                textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--adm-accent)'; e.currentTarget.style.color = 'var(--adm-accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--adm-border)'; e.currentTarget.style.color = 'var(--adm-text-2)' }}
            >
              <span>{a.emoji}</span> {a.label}
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
