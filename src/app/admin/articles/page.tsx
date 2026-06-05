import Link from 'next/link'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { Plus, Edit, Trash2, Eye, EyeOff, Pin } from 'lucide-react'
import { DeleteButton } from '@/components/admin/DeleteButton'

export const revalidate = 0

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: { author: { select: { name: true } } },
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#E8F5EE]">Articles</h1>
          <p className="text-[#9DC4AD] text-sm">{articles.length} articles au total</p>
        </div>
        <Link href="/admin/articles/new" className="btn-primary">
          <Plus size={16} />
          Nouvel article
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(82,183,136,0.1)] bg-[rgba(82,183,136,0.04)]">
                <th className="text-left px-5 py-3 text-[#9DC4AD] font-medium text-xs uppercase tracking-wide">Titre</th>
                <th className="text-left px-5 py-3 text-[#9DC4AD] font-medium text-xs uppercase tracking-wide hidden md:table-cell">Catégorie</th>
                <th className="text-left px-5 py-3 text-[#9DC4AD] font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Auteur</th>
                <th className="text-left px-5 py-3 text-[#9DC4AD] font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="text-left px-5 py-3 text-[#9DC4AD] font-medium text-xs uppercase tracking-wide">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#5A8A6A]">
                    Aucun article. Créez votre premier article !
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-[rgba(82,183,136,0.06)] hover:bg-[rgba(82,183,136,0.03)] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {article.pinned && <Pin size={12} className="text-[#D4A017] flex-shrink-0" />}
                        <span className="text-[#E8F5EE] font-medium line-clamp-1">{article.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="badge-green text-[10px]">{article.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#9DC4AD] hidden lg:table-cell">{article.author.name}</td>
                    <td className="px-5 py-3.5 text-[#5A8A6A] hidden lg:table-cell">{formatDate(article.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      {article.published ? (
                        <span className="flex items-center gap-1 text-[#52B788] text-xs font-medium">
                          <Eye size={12} /> Publié
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#5A8A6A] text-xs font-medium">
                          <EyeOff size={12} /> Brouillon
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="p-1.5 rounded-lg text-[#9DC4AD] hover:text-[#52B788] hover:bg-[rgba(82,183,136,0.08)] transition-colors"
                        >
                          <Edit size={14} />
                        </Link>
                        <DeleteButton id={article.id} endpoint="/api/articles" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
