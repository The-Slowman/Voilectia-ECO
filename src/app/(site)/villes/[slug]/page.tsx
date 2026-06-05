import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatDate, formatRelative } from '@/lib/utils'
import {
  Users, MapPin, Coins, Building2, Crown, ChevronLeft, Plus,
  MessageSquare, Vote, Calendar, CheckCircle2, Clock, Zap,
  ArrowRight, Shield, Star
} from 'lucide-react'
import { CityCommentForm }     from '@/components/city/CityCommentForm'
import { CityJoinButton }      from '@/components/city/CityJoinButton'
import { CityVoteWidget }      from '@/components/city/CityVoteWidget'

export const revalidate = 60

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await prisma.city.findUnique({ where: { slug: params.slug } })
  if (!city) return { title: 'Ville introuvable' }
  return {
    title: `${city.name} — Villes`,
    description: city.description,
  }
}

const PROJECT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  proposed:    { label: 'Proposé',     color: 'text-[#6B8C6A]',  bg: 'bg-[#F2E8D5]' },
  approved:    { label: 'Approuvé',    color: 'text-[#A07810]',  bg: 'bg-[#FBF0C8]' },
  in_progress: { label: 'En cours',    color: 'text-[#1A6A8A]',  bg: 'bg-[rgba(74,158,196,0.1)]' },
  completed:   { label: 'Terminé',     color: 'text-[#2D6A4F]',  bg: 'bg-[rgba(58,122,82,0.1)]' },
  cancelled:   { label: 'Annulé',      color: 'text-red-600',    bg: 'bg-red-50' },
}

export default async function CityHubPage({ params }: Props) {
  const city = await prisma.city.findUnique({
    where: { slug: params.slug, published: true },
    include: {
      images:        { orderBy: { order: 'asc' }, take: 6 },
      memberships:   { where: { status: 'approved' }, orderBy: { joinedAt: 'desc' } },
      announcements: {
        orderBy:  [{ pinned: 'desc' }, { createdAt: 'desc' }],
        take:     5,
        include:  { comments: { where: {}, orderBy: { createdAt: 'asc' } } },
      },
      projects: {
        orderBy: { createdAt: 'desc' },
        include: {
          participants:   true,
          collabFrom:     { include: { partnerCity: { select: { name: true, slug: true, accentColor: true } } } },
        },
      },
      cityVotes: {
        where:   { published: true },
        orderBy: { createdAt: 'desc' },
        take:    3,
        include: { responses: true },
      },
    },
  })
  if (!city) notFound()

  const accent = city.accentColor ?? '#3A7A52'
  const citizenCount = city.memberships.length

  return (
    <div className="bg-[#F2E8D5] min-h-screen">

      {/* ── BANNER ─────────────────────────────────────────────── */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        {city.bannerImage ? (
          <Image src={city.bannerImage} alt={city.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}40, #1A3D2B)` }} />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A3D2B] via-[rgba(26,61,43,0.5)] to-transparent" />
        {/* Ligne or */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px]"
             style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

        <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <Link href="/villes" className="inline-flex items-center gap-1.5 text-[rgba(242,232,213,0.5)]
                                          hover:text-[#F2E8D5] text-xs mb-4 transition-colors">
            <ChevronLeft size={13} /> Toutes les villes
          </Link>
          <div className="flex items-end gap-4">
            {city.coverImage && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0"
                   style={{ borderColor: accent }}>
                <Image src={city.coverImage} alt={city.name} fill className="object-cover" />
              </div>
            )}
            <div>
              <h1 className="font-display font-black text-3xl md:text-4xl text-[#F2E8D5]">{city.name}</h1>
              {city.motto && (
                <p className="text-[rgba(242,232,213,0.6)] text-sm italic mt-1"
                   style={{ fontFamily: 'var(--font-lora)' }}>
                  « {city.motto} »
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS RAPIDES ──────────────────────────────────────── */}
      <div className="bg-white border-b border-[#DBCAA8] py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <Crown size={16} style={{ color: accent }} />
            <span className="font-semibold text-[#1A3D2B]">Maire :</span>
            <span className="text-[#6B8C6A]">{city.mayor}</span>
          </div>
          {city.biome && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} className="text-[#9AB09A]" />
              <span className="text-[#6B8C6A]">{city.biome}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Users size={14} className="text-[#9AB09A]" />
            <span className="text-[#6B8C6A]">{citizenCount} citoyen{citizenCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building2 size={14} className="text-[#9AB09A]" />
            <span className="text-[#6B8C6A]">
              {city.projects.filter(p => p.status !== 'cancelled').length} projet{city.projects.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Bouton rejoindre */}
          <div className="ml-auto">
            <CityJoinButton cityId={city.id} cityName={city.name} accentColor={accent} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── COLONNE PRINCIPALE ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Description */}
            <div className="bg-white border border-[#DBCAA8] rounded-xl p-6"
                 style={{ borderTop: `4px solid ${accent}` }}>
              <p className="text-[#6B8C6A] leading-relaxed">{city.description}</p>
            </div>

            {/* Fil d'annonces */}
            <section>
              <h2 className="font-display font-bold text-[#1A3D2B] text-xl mb-4 flex items-center gap-2">
                <MessageSquare size={18} style={{ color: accent }} />
                Fil d'annonces
              </h2>
              {city.announcements.length === 0 ? (
                <div className="bg-white border border-[#DBCAA8] rounded-xl p-6 text-center text-[#9AB09A]">
                  Aucune annonce pour le moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {city.announcements.map((ann) => (
                    <div key={ann.id}
                         className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden"
                         style={{ borderLeft: ann.pinned ? `4px solid ${accent}` : undefined }}>
                      <div className="p-5">
                        {ann.pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5
                                           rounded-full mb-2 border"
                                style={{ background: `${accent}15`, color: accent, borderColor: `${accent}30` }}>
                            📌 Épinglée
                          </span>
                        )}
                        <h3 className="font-semibold text-[#1A3D2B] text-base mb-2">{ann.title}</h3>
                        <div
                          className="text-[#6B8C6A] text-sm leading-relaxed rich-content"
                          dangerouslySetInnerHTML={{ __html: ann.content }}
                        />
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#DBCAA8]">
                          <div className="flex items-center gap-2 text-xs text-[#9AB09A]">
                            <Crown size={11} style={{ color: accent }} />
                            <span>{ann.authorName}</span>
                            <span>·</span>
                            <span>{formatDate(ann.createdAt)}</span>
                          </div>
                          <span className="flex items-center gap-1 text-xs text-[#9AB09A]">
                            <MessageSquare size={11} /> {ann.comments.length}
                          </span>
                        </div>
                      </div>

                      {/* Commentaires */}
                      {ann.comments.length > 0 && (
                        <div className="border-t border-[#DBCAA8] bg-[#F2E8D5]/50 px-5 py-4 space-y-3">
                          {ann.comments.map((c) => (
                            <div key={c.id} className="flex gap-3">
                              <div className="w-7 h-7 rounded-full bg-[#E8D9BF] border border-[#DBCAA8]
                                              flex items-center justify-center font-bold text-xs
                                              text-[#1A3D2B] flex-shrink-0">
                                {c.authorName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-semibold text-xs text-[#1A3D2B]">{c.authorName}</span>
                                  <span className="text-[10px] text-[#9AB09A]">{formatRelative(c.createdAt)}</span>
                                </div>
                                <p className="text-xs text-[#6B8C6A] leading-relaxed">{c.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Formulaire commentaire */}
                      <div className="border-t border-[#DBCAA8] px-5 py-3">
                        <CityCommentForm announcementId={ann.id} accentColor={accent} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Projets */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-[#1A3D2B] text-xl flex items-center gap-2">
                  <Building2 size={18} style={{ color: accent }} />
                  Projets
                </h2>
                <Link href={`/villes/${city.slug}/projets`}
                      className="text-xs font-semibold flex items-center gap-1 transition-colors"
                      style={{ color: accent }}>
                  Tous les projets <ArrowRight size={12} />
                </Link>
              </div>
              {city.projects.length === 0 ? (
                <div className="bg-white border border-[#DBCAA8] rounded-xl p-6 text-center text-[#9AB09A]">
                  Aucun projet en cours.
                </div>
              ) : (
                <div className="space-y-3">
                  {city.projects.slice(0, 4).map((project) => {
                    const st = PROJECT_STATUS[project.status] ?? PROJECT_STATUS.proposed
                    const collabs = project.collabFrom

                    return (
                      <div key={project.id}
                           className="bg-white border border-[#DBCAA8] rounded-xl p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full
                                               text-[10px] font-bold ${st.bg} ${st.color}`}>
                                {st.label}
                              </span>
                              {collabs != null && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold
                                                 bg-[rgba(74,158,196,0.1)] text-[#1A6A8A]
                                                 border border-[rgba(74,158,196,0.25)] px-2 py-0.5 rounded-full">
                                  🤝 Collaboration
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-[#1A3D2B] text-sm">{project.title}</h3>
                          </div>
                          {project.budget && (
                            <div className="flex items-center gap-1 text-xs font-bold text-[#A07810]
                                            bg-[#FBF0C8] px-2.5 py-1 rounded-full flex-shrink-0">
                              <Coins size={11} /> {project.budget.toLocaleString('fr-FR')} VLC
                            </div>
                          )}
                        </div>
                        <p className="text-[#6B8C6A] text-xs leading-relaxed mb-3 line-clamp-2">
                          {project.description}
                        </p>

                        {/* Barre de progression */}
                        {project.status === 'in_progress' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-[10px] text-[#9AB09A] mb-1">
                              <span>Avancement</span>
                              <span className="font-bold" style={{ color: accent }}>{project.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-[#E8D9BF] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all"
                                   style={{ width: `${project.progress}%`, background: accent }} />
                            </div>
                          </div>
                        )}

                        {/* Participants + villes partenaires */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {project.participants.slice(0, 4).map((p, i) => (
                              <div key={i}
                                   className="w-6 h-6 rounded-full bg-[#E8D9BF] border border-[#DBCAA8]
                                              flex items-center justify-center text-[9px] font-bold text-[#1A3D2B]"
                                   title={p.playerName}>
                                {p.playerName.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {project.participants.length > 4 && (
                              <span className="text-[10px] text-[#9AB09A]">
                                +{project.participants.length - 4}
                              </span>
                            )}
                            {project.participants.length === 0 && (
                              <span className="text-[10px] text-[#9AB09A] italic">Aucun participant</span>
                            )}
                          </div>
                          {collabs.map((c) => (
                            <Link key={c.id} href={`/villes/${c.partnerCity.slug}`}
                                  className="text-[10px] font-semibold text-[#1A6A8A]
                                             bg-[rgba(74,158,196,0.1)] px-2 py-0.5 rounded-full">
                              avec {c.partnerCity.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Galerie */}
            {city.images.length > 0 && (
              <section>
                <h2 className="font-display font-bold text-[#1A3D2B] text-xl mb-4 flex items-center gap-2">
                  <Star size={18} style={{ color: accent }} />
                  Galerie
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {city.images.map((img) => (
                    <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden
                                                  border border-[#DBCAA8] bg-[#E8D9BF]">
                      <Image src={img.url} alt={img.alt ?? city.name} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── COLONNE LATÉRALE ───────────────────────────────── */}
          <div className="space-y-6">

            {/* Votes citoyens */}
            {city.cityVotes.length > 0 && (
              <section>
                <h3 className="font-display font-bold text-[#1A3D2B] text-base mb-3 flex items-center gap-2">
                  <Vote size={16} style={{ color: accent }} />
                  Votes citoyens
                </h3>
                <div className="space-y-3">
                  {city.cityVotes.map((v) => (
                    <CityVoteWidget
                      key={v.id}
                      vote={{ ...v, options: JSON.parse(v.options) as string[] }}
                      accentColor={accent}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Citoyens */}
            <section className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#DBCAA8] flex items-center justify-between">
                <h3 className="font-display font-bold text-[#1A3D2B] text-sm flex items-center gap-2">
                  <Users size={14} style={{ color: accent }} />
                  Citoyens ({citizenCount})
                </h3>
                <CityJoinButton cityId={city.id} cityName={city.name} accentColor={accent} compact />
              </div>
              {city.memberships.length === 0 ? (
                <div className="px-5 py-4 text-center text-[#9AB09A] text-xs">
                  Soyez le premier citoyen !
                </div>
              ) : (
                <div className="divide-y divide-[#DBCAA8]">
                  {city.memberships.slice(0, 8).map((m) => (
                    <div key={m.id} className="px-5 py-2.5 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center
                                      font-bold text-xs flex-shrink-0"
                           style={{ background: `${accent}15`, color: accent }}>
                        {m.playerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs text-[#1A3D2B] truncate">{m.playerName}</span>
                          {m.role === 'deputy' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                  style={{ background: `${accent}15`, color: accent }}>
                              Adjoint
                            </span>
                          )}
                        </div>
                        {m.joinedAt && (
                          <div className="text-[10px] text-[#9AB09A]">
                            Depuis {formatDate(m.joinedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {city.memberships.length > 8 && (
                    <div className="px-5 py-2.5 text-xs text-center text-[#9AB09A]">
                      + {city.memberships.length - 8} autres citoyens
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Collaborations inter-villes */}
            {city.projects.some(p => p.collabFrom.length > 0) && (
              <section className="bg-white border border-[#DBCAA8] rounded-xl p-5">
                <h3 className="font-display font-bold text-[#1A3D2B] text-sm mb-3 flex items-center gap-2">
                  <Shield size={14} className="text-[#4A9EC4]" />
                  Villes partenaires
                </h3>
                <div className="space-y-2">
                  {city.projects
                    .flatMap(p => p.collabFrom)
                    .filter((c, i, arr) => arr.findIndex(x => x.partnerCityId === c.partnerCityId) === i)
                    .slice(0, 5)
                    .map((c) => (
                      <Link key={c.id} href={`/villes/${c.partnerCity.slug}`}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F2E8D5]
                                       transition-colors group">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                             style={{ background: `${c.partnerCity.accentColor ?? '#3A7A52'}20` }}>
                          🏙️
                        </div>
                        <span className="font-medium text-xs text-[#1A3D2B] group-hover:text-[#2D6A4F]">
                          {c.partnerCity.name}
                        </span>
                        <span className={`text-[9px] font-bold ml-auto px-1.5 py-0.5 rounded-full ${
                          c.status === 'accepted' ? 'bg-[rgba(58,122,82,0.1)] text-[#2D6A4F]'
                          : 'bg-[#FBF0C8] text-[#A07810]'
                        }`}>
                          {c.status === 'accepted' ? 'Actif' : 'En discussion'}
                        </span>
                      </Link>
                    ))}
                </div>
                <Link href={`/villes/${city.slug}/projets`}
                      className="mt-3 text-xs flex items-center gap-1 transition-colors"
                      style={{ color: accent }}>
                  Proposer une collaboration <ArrowRight size={11} />
                </Link>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
