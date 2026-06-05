import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { PageHero } from '@/components/ui/PageHero'
import { SurveyCard } from '@/components/survey/SurveyCard'
import { ClipboardList } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sondages',
  description: 'Donnez votre avis sur les prochaines saisons et l\'avenir de Voilectia ECO.',
}

export const revalidate = 60

export default async function SondagePage() {
  const surveys = await prisma.survey.findMany({
    where:   { published: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: {
          answers: { select: { response: true, sessionToken: true } },
        },
      },
    },
  })

  const open   = surveys.filter(s => s.open && (!s.endDate || new Date(s.endDate) > new Date()))
  const closed = surveys.filter(s => !s.open || (s.endDate && new Date(s.endDate) <= new Date()))

  return (
    <div>
      <PageHero
        title="Sondages"
        subtitle="Votre avis compte ! Participez aux sondages pour façonner l'avenir de Voilectia ECO."
        badge="📋 Communauté"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {surveys.length === 0 ? (
          <div className="card p-14 text-center mt-8">
            <ClipboardList size={40} className="text-[#9AB09A] mx-auto mb-4" />
            <h3 className="font-display font-bold text-[#1A3D2B] text-xl mb-2">Aucun sondage actif</h3>
            <p className="text-[#6B8C6A] text-sm">
              Revenez bientôt — de nouveaux sondages seront publiés avant chaque saison.
            </p>
          </div>
        ) : (
          <div className="space-y-10 pt-8">

            {/* Sondages ouverts */}
            {open.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-[#1A3D2B] text-xl mb-5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3A7A52] animate-pulse" />
                  Sondages en cours
                </h2>
                <div className="space-y-6">
                  {open.map(s => <SurveyCard key={s.id} survey={s} />)}
                </div>
              </section>
            )}

            {/* Sondages terminés */}
            {closed.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-[#9AB09A] text-base mb-4">
                  Sondages terminés
                </h2>
                <div className="space-y-6 opacity-75">
                  {closed.map(s => <SurveyCard key={s.id} survey={s} closed />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
