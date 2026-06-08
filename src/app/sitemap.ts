import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://voilectia.fr'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/presentation`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/economie`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/reglement`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/federation`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/serveur`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/progression`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/staff`,          lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/forum`,          lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/guides`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/changelog`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/evenements`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/tutoriels`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/giveaways`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE}/recrutement`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE}/sondage`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${BASE}/faq`,            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/connexion`,      lastModified: now, changeFrequency: 'never',   priority: 0.3 },
    { url: `${BASE}/inscription`,    lastModified: now, changeFrequency: 'never',   priority: 0.3 },
  ]

  try {
    const [articles, guides, events, tutorials, forumPosts, giveaways] = await Promise.all([
      prisma.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.guide.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.event.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.tutorial.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.forumPost.findMany({ where: { approved: true }, select: { slug: true, updatedAt: true, category: { select: { slug: true } } } }),
      prisma.giveaway.findMany({ where: { published: true }, select: { id: true, updatedAt: true } }),
    ])

    const dynamic: MetadataRoute.Sitemap = [
      ...articles.map(a => ({ url: `${BASE}/actualites/${a.slug}`, lastModified: a.updatedAt, changeFrequency: 'weekly' as const, priority: 0.7 })),
      ...guides.map(g => ({ url: `${BASE}/guides/${g.slug}`, lastModified: g.updatedAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
      ...events.map(e => ({ url: `${BASE}/evenements/${e.slug}`, lastModified: e.updatedAt, changeFrequency: 'weekly' as const, priority: 0.6 })),
      ...tutorials.map(t => ({ url: `${BASE}/tutoriels/${t.slug}`, lastModified: t.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
      ...forumPosts.map(p => ({ url: `${BASE}/forum/${p.category.slug}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly' as const, priority: 0.5 })),
      ...giveaways.map(g => ({ url: `${BASE}/giveaways/${g.id}`, lastModified: g.updatedAt, changeFrequency: 'daily' as const, priority: 0.6 })),
    ]

    return [...staticPages, ...dynamic]
  } catch {
    return staticPages
  }
}
