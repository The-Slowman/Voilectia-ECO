import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { Plus, Edit, Pin } from 'lucide-react'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { PublishedBadge, AdminBadge } from '@/components/admin/AdminBadge'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

export const revalidate = 0

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: { author: { select: { name: true } } },
  })

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Articles</h1>
          <p className="adm-page-subtitle">{articles.length} article{articles.length !== 1 ? 's' : ''} au total</p>
        </div>
        <Link href="/admin/articles/new" className="adm-btn adm-btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={14} /> Nouvel article
        </Link>
      </div>

      {articles.length === 0 ? (
        <AdminEmptyState
          icon="📰"
          title="Aucun article"
          desc="Rédigez votre premier article pour informer la communauté."
          action={{ label: 'Nouvel article', href: '/admin/articles/new' }}
        />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Auteur</th>
                <th>Date</th>
                <th>Statut</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {article.pinned && (
                        <Pin size={11} style={{ color: 'var(--adm-gold)', flexShrink: 0 }} />
                      )}
                      <span style={{ fontWeight: 500, color: 'var(--adm-text-1)' }}>{article.title}</span>
                    </div>
                  </td>
                  <td>
                    <AdminBadge variant="blue">{article.category}</AdminBadge>
                  </td>
                  <td style={{ color: 'var(--adm-text-2)' }}>{article.author.name}</td>
                  <td style={{ color: 'var(--adm-text-3)' }}>{formatDate(article.createdAt)}</td>
                  <td><PublishedBadge published={article.published} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                      <Link href={`/admin/articles/${article.id}`} className="adm-btn adm-btn-ghost adm-btn-sm">
                        <Edit size={13} />
                      </Link>
                      <DeleteButton id={article.id} endpoint="/api/articles" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
