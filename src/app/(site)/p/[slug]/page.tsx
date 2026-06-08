import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitize'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await prisma.customPage.findFirst({ where: { slug: params.slug, published: true } })
  if (!page) return { title: 'Introuvable' }
  return { title: page.title }
}

export const revalidate = 300

export default async function CustomPageView({ params }: Props) {
  const page = await prisma.customPage.findFirst({
    where: { slug: params.slug, published: true },
  })
  if (!page) notFound()

  return (
    <div className="bg-[#F2E8D5] min-h-screen">
      {/* Hero */}
      <div className="bg-[#1A3D2B] pt-24 pb-14 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C1F14] to-transparent opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px]
                        bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          {page.icon && <div className="text-4xl mb-3">{page.icon}</div>}
          <h1 className="font-display font-black text-4xl text-[#F2E8D5]">{page.title}</h1>
          <p className="text-[rgba(242,232,213,0.4)] text-xs mt-3">
            Mis à jour le {formatDate(page.updatedAt)}
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-20">
        <div className="bg-white border border-[#DBCAA8] rounded-2xl p-8 shadow-sm">
          <div
            className="rich-content prose prose-sm max-w-none text-[#1A3D2B]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
          />
        </div>
      </div>
    </div>
  )
}
