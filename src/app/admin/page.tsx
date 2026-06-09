import { prisma } from '@/lib/db'
import Link from 'next/link'
import {
  FileText, RefreshCw, BookOpen, Gift, ArrowUpRight, ArrowRight,
  Calendar, HelpCircle, Shield, GraduationCap, FileCode,
  Zap, Plus, ExternalLink,
} from 'lucide-react'
import { formatRelative } from '@/lib/utils'

export const revalidate = 30

async function getDashboardData() {
  const [
    articleCount, changelogCount, guideCount, tutorialCount,
    faqCount, staffCount, giveawayCount, eventCount, pageCount,
    recentArticles, recentChangelogs,
  ] = await Promise.all([
    prisma.article.count({ where: { published: true } }),
    prisma.changelog.count({ where: { published: true } }),
    prisma.guide.count({ where: { published: true } }),
    prisma.tutorial.count({ where: { published: true } }),
    prisma.faqItem.count({ where: { published: true } }),
    prisma.staffMember.count({ where: { active: true } }),
    prisma.giveaway.count({ where: { published: true, ended: false } }),
    prisma.event.count({ where: { published: true } }),
    prisma.customPage.count({ where: { published: true } }),
    prisma.article.findMany({
      take: 6, orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    }),
    prisma.changelog.findMany({
      take: 6, orderBy: { createdAt: 'desc' },
    }),
  ])

  return {
    stats: {
      articleCount, changelogCount, guideCount, tutorialCount,
      faqCount, staffCount, giveawayCount, eventCount, pageCount,
    },
    recentArticles, recentChangelogs,
  }
}

/* ═══════════════════════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════════════════════ */
function StatCard({
  label, value, icon, href, color, bg, description,
}: {
  label: string; value: number; icon: React.ReactNode
  href: string; color: string; bg: string
  description?: string
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
          <ArrowUpRight size={13} style={{ color: 'var(--adm-text-4)', marginTop: 2 }} />
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
    <Link href={href} className="adm-mini-stat">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          className="adm-activity-link"
          style={{ fontSize: 11, color: 'var(--adm-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}
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
   DASHBOARD
   ═══════════════════════════════════════════════════════════ */
export default async function AdminDashboard() {
  const { stats, recentArticles, recentChangelogs } = await getDashboardData()
  const hour = new Date().getHours()
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
            Gestion du contenu de <strong style={{ color: 'var(--adm-accent)', fontWeight: 600 }}>Voilectia ECO</strong>
          </p>
        </div>
        <Link href="/" target="_blank" className="adm-btn adm-btn-ghost adm-btn-sm" style={{ textDecoration: 'none' }}>
          <ExternalLink size={12} />
          Voir le site
        </Link>
      </div>

      {/* ── Actions rapides ──────────────────────────────── */}
      <div className="adm-card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Zap size={14} style={{ color: 'var(--adm-gold)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-text-1)' }}>Actions rapides</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'Nouvel article',    href: '/admin/articles',   emoji: '📰' },
            { label: 'Nouveau changelog', href: '/admin/changelog',  emoji: '📜' },
            { label: 'Nouveau guide',     href: '/admin/guides',     emoji: '📚' },
            { label: 'Nouvel événement',  href: '/admin/evenements', emoji: '🎉' },
            { label: 'Nouveau giveaway',  href: '/admin/giveaways',  emoji: '🎁' },
            { label: 'Page CMS',          href: '/admin/contenus',   emoji: '📄' },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="adm-quick-action">
              <Plus size={11} style={{ opacity: 0.6 }} />
              <span>{a.emoji}</span>
              <span>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Stat cards principales ───────────────────────── */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--adm-text-4)', marginBottom: 12 }}>
          Vue d'ensemble
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
          <StatCard
            label="Articles publiés" value={stats.articleCount}
            icon={<FileText size={19} />} href="/admin/articles"
            color="var(--adm-blue)" bg="var(--adm-blue-sub)"
            description="Actualités du serveur"
          />
          <StatCard
            label="Guides" value={stats.guideCount}
            icon={<BookOpen size={19} />} href="/admin/guides"
            color="var(--adm-accent)" bg="var(--adm-accent-sub)"
          />
          <StatCard
            label="Entrées changelog" value={stats.changelogCount}
            icon={<RefreshCw size={19} />} href="/admin/changelog"
            color="var(--adm-purple)" bg="var(--adm-purple-sub)"
          />
          <StatCard
            label="Événements" value={stats.eventCount}
            icon={<Calendar size={19} />} href="/admin/evenements"
            color="var(--adm-gold)" bg="var(--adm-gold-sub)"
          />
        </div>
      </div>

      {/* ── Mini stats secondaires ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        <MiniStat label="Tutoriels"  value={stats.tutorialCount}  icon={<GraduationCap size={15} />} href="/admin/tutoriels"  color="var(--adm-blue)" />
        <MiniStat label="FAQ"        value={stats.faqCount}       icon={<HelpCircle size={15} />}    href="/admin/faq"        color="var(--adm-purple)" />
        <MiniStat label="Giveaways"  value={stats.giveawayCount}  icon={<Gift size={15} />}          href="/admin/giveaways"  color="var(--adm-orange)" />
        <MiniStat label="Staff"      value={stats.staffCount}     icon={<Shield size={15} />}        href="/admin/staff"      color="var(--adm-red)" />
        <MiniStat label="Pages CMS"  value={stats.pageCount}      icon={<FileCode size={15} />}      href="/admin/contenus"   color="var(--adm-accent)" />
      </div>

      {/* ── Activity grid ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>

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
                  <Link href={`/admin/articles/${a.id}`} className="adm-activity-edit">
                    <ArrowUpRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </ActivityCard>

        {/* Changelog récent */}
        <ActivityCard
          title="Changelog récent"
          icon={<RefreshCw size={14} />} color="var(--adm-purple)"
          href="/admin/changelog" linkLabel="Gérer"
        >
          {recentChangelogs.length === 0 ? (
            <div style={{ padding: '20px 18px', textAlign: 'center', color: 'var(--adm-text-4)', fontSize: 12 }}>
              Aucune entrée
            </div>
          ) : (
            <div>
              {recentChangelogs.map((c, i) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 18px',
                    borderTop: i > 0 ? '1px solid var(--adm-border-muted)' : 'none',
                  }}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: c.published ? 'var(--adm-accent)' : 'var(--adm-text-4)',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--adm-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 450 }}>
                      {c.version ? `${c.version} — ` : ''}{c.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--adm-text-4)', marginTop: 1 }}>{formatRelative(c.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ActivityCard>
      </div>

    </div>
  )
}
