import { prisma } from '@/lib/db'
import Link from 'next/link'
import {
  Users, FileText, RefreshCw, BookOpen, Building2, MessageSquare,
  Lightbulb, Gift, ArrowUpRight, ArrowRight, Calendar,
  Shield, HelpCircle, Mail, AlertTriangle, TrendingUp,
  Zap, Plus,
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
    prisma.giveaway.count({ where: { published: true, ended: false } }),
    prisma.event.count({ where: { published: true } }),
    prisma.article.findMany({
      take: 5, orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    }),
    prisma.contactMessage.findMany({
      take: 5, where: { read: false }, orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      take: 6, where: { role: 'PLAYER' }, orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, createdAt: true, email: true },
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

/* ═══════════════════════════════════════════════════════════
   STAT CARD COMPONENT
   ═══════════════════════════════════════════════════════════ */
function StatCard({
  label, value, icon, href, color, bg, badge, description,
}: {
  label: string; value: number; icon: React.ReactNode
  href: string; color: string; bg: string
  badge?: number; description?: string
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="adm-stat-card" style={{ height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: bg, color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {icon}
          </div>
          {badge !== undefined && badge > 0 ? (
            <span className="adm-notif-dot">{badge}</span>
          ) : (
            <ArrowUpRight size={13} style={{ color: 'var(--adm-text-4)', marginTop: 2 }} />
          )}
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--adm-text-1)', lineHeight: 1, marginBottom: 5, letterSpacing: '-0.03em' }}>
          {value.toLocaleString()}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--adm-text-2)', marginBottom: description ? 4 : 0 }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 11, color: 'var(--adm-text-4)', lineHeight: 1.4 }}>
            {description}
          </div>
        )}
      </div>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════════
   MINI STAT
   ═══════════════════════════════════════════════════════════ */
function MiniStat({ label, value, icon, href, color }: {
  label: string; value: number; icon: React.ReactNode; href: string; color: string
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'var(--adm-surface)', border: '1px solid var(--adm-border)',
        borderRadius: 8, padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'border-color 0.15s, transform 0.15s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--adm-accent)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--adm-border)'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
      >
        <div style={{ color, flexShrink: 0 }}>{icon}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--adm-text-1)', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
          <div style={{ fontSize: 11, color: 'var(--adm-text-3)', marginTop: 2, whiteSpace: 'nowrap' }}>{label}</div>
        </div>
      </div>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════════
   ACTIVITY CARD
   ═══════════════════════════════════════════════════════════ */
function ActivityCard({
  title, icon, color, href, linkLabel, children,
}: {
  title: React.ReactNode; icon: React.ReactNode; color: string
  href: string; linkLabel: string; children: React.ReactNode
}) {
  return (
    <div className="adm-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px 12px',
        borderBottom: '1px solid var(--adm-border-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ color, flexShrink: 0 }}>{icon}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-text-1)' }}>{title}</span>
        </div>
        <Link
          href={href}
          style={{ fontSize: 11, color: 'var(--adm-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {linkLabel} <ArrowRight size={11} />
        </Link>
      </div>
      <div style={{ padding: '10px 0', flex: 1 }}>
        {children}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════ */
export default async function AdminDashboard() {
  const { stats, recentArticles, recentMessages, recentPlayers } = await getDashboardData()
  const hasAlerts = stats.messageCount > 0 || stats.suggestionCount > 0 || stats.pendingForumPosts > 0
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Page header ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>🌿</span>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--adm-text-1)', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
              {greeting} 👋
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--adm-text-3)', marginTop: 4 }}>
            Vue d'ensemble de <strong style={{ color: 'var(--adm-accent)', fontWeight: 600 }}>Voilectia ECO</strong>
          </p>
        </div>
        <Link href="/admin/membres" className="adm-btn adm-btn-ghost adm-btn-sm" style={{ textDecoration: 'none' }}>
          <TrendingUp size={12} />
          Activité
        </Link>
      </div>

      {/* ── Alertes ──────────────────────────────────────── */}
      {hasAlerts && (
        <div className="adm-alert adm-alert-warning">
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Actions en attente</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {stats.messageCount > 0 && (
                <Link href="/admin/messages" style={{ fontSize: 12, color: 'inherit', textDecoration: 'none', opacity: 0.85, fontWeight: 500 }}>
                  📩 {stats.messageCount} message{stats.messageCount > 1 ? 's' : ''} non lu{stats.messageCount > 1 ? 's' : ''}
                </Link>
              )}
              {stats.suggestionCount > 0 && (
                <Link href="/admin/suggestions" style={{ fontSize: 12, color: 'inherit', textDecoration: 'none', opacity: 0.85, fontWeight: 500 }}>
                  💡 {stats.suggestionCount} suggestion{stats.suggestionCount > 1 ? 's' : ''} en attente
                </Link>
              )}
              {stats.pendingForumPosts > 0 && (
                <Link href="/admin/forum" style={{ fontSize: 12, color: 'inherit', textDecoration: 'none', opacity: 0.85, fontWeight: 500 }}>
                  💬 {stats.pendingForumPosts} post{stats.pendingForumPosts > 1 ? 's' : ''} forum à modérer
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Stat cards principales (6 cartes) ────────────── */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--adm-text-4)', marginBottom: 12 }}>
          Vue d'ensemble
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
          <StatCard
            label="Joueurs inscrits" value={stats.playerCount}
            icon={<Users size={19} />} href="/admin/membres"
            color="var(--adm-accent)" bg="var(--adm-accent-sub)"
            description="Comptes joueurs actifs"
          />
          <StatCard
            label="Articles publiés" value={stats.articleCount}
            icon={<FileText size={19} />} href="/admin/articles"
            color="var(--adm-blue)" bg="var(--adm-blue-sub)"
          />
          <StatCard
            label="Villes actives" value={stats.cityCount}
            icon={<Building2 size={19} />} href="/admin/villes"
            color="var(--adm-cyan)" bg="var(--adm-cyan-sub)"
          />
          <StatCard
            label="Sujets forum" value={stats.forumPostCount}
            icon={<MessageSquare size={19} />} href="/admin/forum"
            color="var(--adm-purple)" bg="var(--adm-purple-sub)"
            badge={stats.pendingForumPosts}
          />
          <StatCard
            label="Messages non lus" value={stats.messageCount}
            icon={<Mail size={19} />} href="/admin/messages"
            color="var(--adm-red)" bg="var(--adm-red-sub)"
            badge={stats.messageCount}
          />
          <StatCard
            label="Suggestions" value={stats.suggestionCount}
            icon={<Lightbulb size={19} />} href="/admin/suggestions"
            color="var(--adm-gold)" bg="var(--adm-gold-sub)"
            badge={stats.suggestionCount}
          />
        </div>
      </div>

      {/* ── Mini stats secondaires ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        <MiniStat label="Changelogs"   value={stats.changelogCount} icon={<RefreshCw size={15} />}  href="/admin/changelog"  color="var(--adm-accent)" />
        <MiniStat label="Guides"       value={stats.guideCount}     icon={<BookOpen size={15} />}   href="/admin/guides"     color="var(--adm-blue)" />
        <MiniStat label="Événements"   value={stats.eventCount}     icon={<Calendar size={15} />}   href="/admin/evenements" color="var(--adm-gold)" />
        <MiniStat label="Staff actif"  value={stats.staffCount}     icon={<Shield size={15} />}     href="/admin/staff"      color="var(--adm-red)" />
        <MiniStat label="FAQ"          value={stats.faqCount}       icon={<HelpCircle size={15} />} href="/admin/faq"        color="var(--adm-purple)" />
        <MiniStat label="Giveaways"    value={stats.giveawayCount}  icon={<Gift size={15} />}       href="/admin/giveaways"  color="var(--adm-orange)" />
      </div>

      {/* ── Activity grid ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>

        {/* Derniers inscrits */}
        <ActivityCard
          title="Derniers inscrits"
          icon={<Users size={14} />} color="var(--adm-accent)"
          href="/admin/membres" linkLabel="Voir tous"
        >
          {recentPlayers.length === 0 ? (
            <div style={{ padding: '20px 18px', textAlign: 'center', color: 'var(--adm-text-4)', fontSize: 12 }}>
              Aucun joueur inscrit
            </div>
          ) : (
            <div>
              {recentPlayers.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 18px',
                    borderTop: i > 0 ? '1px solid var(--adm-border-muted)' : 'none',
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'var(--adm-accent-sub)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'var(--adm-accent)', flexShrink: 0,
                  }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--adm-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--adm-text-4)', marginTop: 1 }}>{formatRelative(p.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ActivityCard>

        {/* Articles récents */}
        <ActivityCard
          title="Articles récents"
          icon={<FileText size={14} />} color="var(--adm-blue)"
          href="/admin/articles" linkLabel="Gérer"
        >
          {recentArticles.length === 0 ? (
            <div style={{ padding: '20px 18px', textAlign: 'center', color: 'var(--adm-text-4)', fontSize: 12 }}>
              Aucun article
            </div>
          ) : (
            <div>
              {recentArticles.map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 18px',
                    borderTop: i > 0 ? '1px solid var(--adm-border-muted)' : 'none',
                  }}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: a.published ? 'var(--adm-accent)' : 'var(--adm-text-4)',
                    marginTop: 1,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--adm-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 450 }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--adm-text-4)', marginTop: 1 }}>
                      {a.author.name} · {formatRelative(a.createdAt)}
                    </div>
                  </div>
                  <Link
                    href={`/admin/articles/${a.id}`}
                    style={{ color: 'var(--adm-text-4)', flexShrink: 0, lineHeight: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--adm-accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--adm-text-4)')}
                  >
                    <ArrowUpRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </ActivityCard>

        {/* Messages non lus */}
        <ActivityCard
          title={<>Messages {stats.messageCount > 0 && <span className="adm-notif-dot" style={{ fontSize: 9 }}>{stats.messageCount}</span>}</>}
          icon={<Mail size={14} />} color="var(--adm-red)"
          href="/admin/messages" linkLabel="Voir tous"
        >
          {recentMessages.length === 0 ? (
            <div style={{ padding: '20px 18px', textAlign: 'center', color: 'var(--adm-text-4)', fontSize: 12 }}>
              Aucun message non lu ✅
            </div>
          ) : (
            <div>
              {recentMessages.map((msg, i) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '7px 18px',
                    borderTop: i > 0 ? '1px solid var(--adm-border-muted)' : 'none',
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: 'var(--adm-orange)',
                    flexShrink: 0, marginTop: 5,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--adm-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--adm-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                      {msg.subject}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--adm-text-4)', marginTop: 1 }}>{formatRelative(msg.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ActivityCard>
      </div>

      {/* ── Actions rapides ───────────────────────────────── */}
      <div className="adm-card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Zap size={14} style={{ color: 'var(--adm-gold)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-text-1)' }}>Actions rapides</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'Nouvel article',    href: '/admin/articles',       emoji: '📰' },
            { label: 'Nouveau changelog', href: '/admin/changelog',      emoji: '📜' },
            { label: 'Nouveau guide',     href: '/admin/guides',         emoji: '📚' },
            { label: 'Nouvelle ville',    href: '/admin/villes/nouveau', emoji: '🏘️' },
            { label: 'Nouvel événement',  href: '/admin/evenements',     emoji: '🎉' },
            { label: 'Nouveau giveaway',  href: '/admin/giveaways',      emoji: '🎁' },
            { label: 'Nouveau membre',    href: '/admin/membres',        emoji: '👤' },
            { label: 'Page CMS',          href: '/admin/contenus',       emoji: '📄' },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="adm-quick-action">
              <Plus size={11} style={{ opacity: 0.6 }} />
              <span>{a.emoji}</span>
              <span>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
