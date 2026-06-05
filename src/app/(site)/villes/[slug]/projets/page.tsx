import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { Building2, ChevronLeft, Plus, Coins, Users, Zap } from 'lucide-react'
import type { CityProject, CityProjectParticipant, CityCollaboration, City as PrismaCity } from '@prisma/client'

type ProjectWithRelations = CityProject & {
  participants: CityProjectParticipant[]
  collabFrom:   (CityCollaboration & {
    partnerCity: Pick<PrismaCity, 'name' | 'slug' | 'accentColor'>
  }) | null
}

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await prisma.city.findUnique({ where: { slug: params.slug } })
  if (!city) return { title: 'Introuvable' }
  return { title: `Projets — ${city.name}` }
}

export const revalidate = 60

const PROJECT_STATUS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  proposed:    { label: 'Proposé',     color: 'text-[#6B8C6A]',  bg: 'bg-[#F2E8D5]',                 dot: 'bg-[#9AB09A]' },
  approved:    { label: 'Approuvé',    color: 'text-[#A07810]',  bg: 'bg-[#FBF0C8]',                 dot: 'bg-[#D4A820]' },
  in_progress: { label: 'En cours',    color: 'text-[#1A6A8A]',  bg: 'bg-[rgba(74,158,196,0.1)]',    dot: 'bg-[#4A9EC4] animate-pulse' },
  completed:   { label: 'Terminé',     color: 'text-[#2D6A4F]',  bg: 'bg-[rgba(58,122,82,0.1)]',     dot: 'bg-[#3A7A52]' },
  cancelled:   { label: 'Annulé',      color: 'text-red-500',    bg: 'bg-red-50',                    dot: 'bg-red-400' },
}

function ProjectCard({ project, accent }: { project: ProjectWithRelations; accent: string }) {
    const st      = PROJECT_STATUS[project.status] ?? PROJECT_STATUS.proposed
    const collab  = project.collabFrom

    return (
      <div className="bg-white border border-[#DBCAA8] rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
                               text-[10px] font-bold ${st.bg} ${st.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </span>
              {collab != null && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold
                                 bg-[rgba(74,158,196,0.1)] text-[#1A6A8A]
                                 border border-[rgba(74,158,196,0.25)] px-2 py-0.5 rounded-full">
                  🤝 Collaboration
                </span>
              )}
            </div>
            <h3 className="font-semibold text-[#1A3D2B] text-base">{project.title}</h3>
          </div>
          {project.budget && (
            <div className="flex items-center gap-1 text-xs font-bold text-[#A07810]
                            bg-[#FBF0C8] px-3 py-1.5 rounded-full flex-shrink-0">
              <Coins size={12} /> {project.budget.toLocaleString('fr-FR')} VLC
            </div>
          )}
        </div>

        <p className="text-[#6B8C6A] text-sm leading-relaxed mb-4">{project.description}</p>

        {/* Barre de progression */}
        {project.status === 'in_progress' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-[#9AB09A] mb-1.5">
              <span className="flex items-center gap-1"><Zap size={11} /> Avancement</span>
              <span className="font-bold" style={{ color: accent }}>{project.progress}%</span>
            </div>
            <div className="h-2 bg-[#E8D9BF] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                   style={{ width: `${project.progress}%`, background: accent }} />
            </div>
          </div>
        )}

        {/* Dates */}
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-4 text-xs text-[#9AB09A] mb-4">
            {project.startDate && <span>Début : {formatDate(project.startDate)}</span>}
            {project.endDate   && <span>Fin prévue : {formatDate(project.endDate)}</span>}
          </div>
        )}

        {/* Participants + partenaires */}
        <div className="flex items-center justify-between border-t border-[#DBCAA8] pt-3 mt-1">
          <div className="flex items-center gap-2">
            <Users size={13} className="text-[#9AB09A]" />
            <div className="flex items-center gap-1">
              {project.participants.slice(0, 5).map((p, i) => (
                <div key={i}
                     className="w-6 h-6 rounded-full bg-[#E8D9BF] border border-[#DBCAA8]
                                flex items-center justify-center text-[9px] font-bold text-[#1A3D2B]"
                     title={p.name}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {project.participants.length > 5 && (
                <span className="text-[10px] text-[#9AB09A] ml-1">+{project.participants.length - 5}</span>
              )}
              {project.participants.length === 0 && (
                <span className="text-[10px] text-[#9AB09A] italic">Aucun participant</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {collab && (
              <Link href={`/villes/${collab.partnerCity.slug}`}
                    className="text-[10px] font-semibold text-[#1A6A8A]
                               bg-[rgba(74,158,196,0.1)] border border-[rgba(74,158,196,0.25)]
                               px-2.5 py-1 rounded-full hover:bg-[rgba(74,158,196,0.2)] transition-colors">
                avec {collab.partnerCity.name}
              </Link>
            )}
          </div>
        </div>
      </div>
    )
}

export default async function VilleProjetsPage({ params }: Props) {
  const city = await prisma.city.findUnique({
    where: { slug: params.slug, published: true },
    include: {
      projects: {
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        include: {
          participants: true,
          collabFrom: {
            include: { partnerCity: { select: { name: true, slug: true, accentColor: true } } },
          },
        },
      },
    },
  })
  if (!city) notFound()

  const accent   = city.accentColor ?? '#3A7A52'
  const active   = city.projects.filter(p => p.status === 'in_progress') as ProjectWithRelations[]
  const other    = city.projects.filter(p => p.status !== 'in_progress' && p.status !== 'cancelled') as ProjectWithRelations[]
  const cancelled = city.projects.filter(p => p.status === 'cancelled') as ProjectWithRelations[]

  return (
    <div className="bg-[#F2E8D5] min-h-screen">
      {/* Hero */}
      <div className="bg-[#1A3D2B] pt-24 pb-12 relative">
        <div className="absolute inset-0"
             style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}25, transparent 60%)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-[3px]"
             style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <Link href={`/villes/${params.slug}`}
                className="inline-flex items-center gap-1.5 text-[rgba(242,232,213,0.5)]
                           hover:text-[#F2E8D5] text-xs mb-6 transition-colors">
            <ChevronLeft size={13} /> Retour à {city.name}
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-black text-3xl text-[#F2E8D5] mb-1">
                Projets de {city.name}
              </h1>
              <p className="text-[rgba(242,232,213,0.5)] text-sm">
                {city.projects.filter(p => p.status !== 'cancelled').length} projet{city.projects.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link href={`/villes/${params.slug}/projets/nouveau`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                             text-white transition-opacity hover:opacity-80 flex-shrink-0"
                  style={{ background: accent }}>
              <Plus size={15} /> Proposer un projet
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-20 space-y-10">

        {/* En cours */}
        {active.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-[#1A3D2B] text-xl mb-4 flex items-center gap-2">
              <Zap size={18} style={{ color: accent }} />
              En cours
            </h2>
            <div className="space-y-4">
              {active.map(p => <ProjectCard key={p.id} project={p} accent={accent} />)}
            </div>
          </section>
        )}

        {/* Autres statuts */}
        {other.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-[#1A3D2B] text-xl mb-4 flex items-center gap-2">
              <Building2 size={18} style={{ color: accent }} />
              Tous les projets
            </h2>
            <div className="space-y-4">
              {other.map(p => <ProjectCard key={p.id} project={p} accent={accent} />)}
            </div>
          </section>
        )}

        {/* Annulés */}
        {cancelled.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-[#9AB09A] text-base mb-3">Annulés</h2>
            <div className="space-y-3 opacity-60">
              {cancelled.map(p => <ProjectCard key={p.id} project={p} accent={accent} />)}
            </div>
          </section>
        )}

        {city.projects.length === 0 && (
          <div className="bg-white border border-[#DBCAA8] rounded-xl p-12 text-center">
            <Building2 size={36} className="text-[#9AB09A] mx-auto mb-3" />
            <p className="text-[#6B8C6A] mb-4">Aucun projet pour le moment.</p>
            <Link href={`/villes/${params.slug}/projets/nouveau`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                             text-white" style={{ background: accent }}>
              <Plus size={14} /> Proposer le premier projet
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
