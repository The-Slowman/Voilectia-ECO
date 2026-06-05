import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'
import { prisma } from '@/lib/db'
import { HelpCircle, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Foire aux questions — Toutes les réponses aux questions fréquentes sur le serveur Voilectia ECO.',
}

export const revalidate = 300

export default async function FaqPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const selectedCat = searchParams.category

  const categories = await prisma.faqCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      items: {
        where: { published: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  const filteredCategories = selectedCat
    ? categories.filter((c) => c.id === selectedCat)
    : categories

  return (
    <div>
      <PageHero
        title="FAQ"
        subtitle="Vous avez une question ? Retrouvez ici les réponses aux interrogations les plus fréquentes."
        badge="❓ Questions & Réponses"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <a
              href="/faq"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !selectedCat ? 'bg-[#2D6A4F] text-[#E8F5EE]' : 'text-[#2D6A4F] border border-[rgba(82,183,136,0.3)] hover:border-[#52B788] hover:text-[#1A3D2B]'
              }`}
            >
              Tout voir
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/faq?category=${cat.id}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCat === cat.id ? 'bg-[#2D6A4F] text-[#E8F5EE]' : 'text-[#2D6A4F] border border-[rgba(82,183,136,0.3)] hover:border-[#52B788] hover:text-[#1A3D2B]'
                }`}
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
              </a>
            ))}
          </div>
        )}

        {/* FAQ accordion */}
        {filteredCategories.length === 0 || filteredCategories.every((c) => c.items.length === 0) ? (
          <div className="card p-8 text-center text-[#3D5F4A]">
            <HelpCircle size={32} className="mx-auto mb-3 opacity-50" />
            <p>Aucune question pour le moment. Posez les vôtres sur Discord !</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((cat) => (
              cat.items.length > 0 && (
                <section key={cat.id}>
                  <h2 className="font-display text-lg font-bold text-[#1A3D2B] mb-4 flex items-center gap-2">
                    {cat.icon && <span>{cat.icon}</span>}
                    {cat.name}
                  </h2>
                  <div className="space-y-3">
                    {cat.items.map((item) => (
                      <details
                        key={item.id}
                        className="card group open:border-[rgba(82,183,136,0.25)]"
                      >
                        <summary className="flex items-center justify-between p-5 cursor-pointer list-none select-none">
                          <span className="font-medium text-[#1A3D2B] text-sm pr-4 group-open:text-[#52B788] transition-colors">
                            {item.question}
                          </span>
                          <HelpCircle
                            size={16}
                            className="text-[#3D5F4A] flex-shrink-0 group-open:text-[#52B788] transition-colors"
                          />
                        </summary>
                        <div className="px-5 pb-5 text-[#4A6854] text-sm leading-relaxed border-t border-[rgba(82,183,136,0.1)] pt-4">
                          {item.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )
            ))}
          </div>
        )}

        {/* Aide supplémentaire */}
        <div className="mt-10 card p-6 text-center">
          <p className="text-[#4A6854] text-sm mb-4">
            Vous n'avez pas trouvé votre réponse ? Posez votre question directement sur Discord.
          </p>
          <a
            href={process.env.NEXT_PUBLIC_DISCORD_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-discord inline-flex text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.93 21.19a.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Poser ma question
            <ExternalLink size={12} />
          </a>
        </div>

      </div>
    </div>
  )
}
