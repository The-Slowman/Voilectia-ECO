import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ArticleForm } from '@/components/admin/ArticleForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 0

interface Props {
  params: { id: string }
}

export default async function EditArticlePage({ params }: Props) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    select: {
      id:         true,
      title:      true,
      slug:       true,
      excerpt:    true,
      content:    true,
      coverImage: true,
      category:   true,
      published:  true,
      pinned:     true,
      metaTitle:  true,
      metaDesc:   true,
    },
  })

  if (!article) notFound()

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Modifier l'article</h1>
          <p className="adm-page-subtitle">{article.title}</p>
        </div>
        <Link href="/admin/articles" className="adm-btn adm-btn-ghost" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Retour aux articles
        </Link>
      </div>

      <ArticleForm article={article} />
    </div>
  )
}
