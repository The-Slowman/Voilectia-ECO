import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Calendar, Plug } from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'
import { CopyButton } from '@/components/ui/CopyButton'
import { ensureServerConfigSchema } from '@/lib/server-config-heal'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'Configuration du serveur — Voilectia ECO',
  description: 'Taille du monde, progression, economie, gameplay et connexion du serveur Eco Voilectia.',
  alternates: { canonical: '/configuration' },
}

interface PItem { id: string; label: string; value: string; description: string | null; icon: string | null }
interface PGroup { id: string; title: string; icon: string | null; items: PItem[] }

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  preparation: { label: 'En preparation', color: '#B8860B', bg: 'rgba(212,168,32,0.14)' },
  open:        { label: 'Serveur ouvert', color: '#2D6A4F', bg: 'rgba(82,183,136,0.16)' },
  closed:      { label: 'Ferme',          color: '#6B7280', bg: 'rgba(120,120,120,0.14)' },
  maintenance: { label: 'Maintenance',    color: '#C2691F', bg: 'rgba(224,138,74,0.14)' },
}

async function getData() {
  let config: Awaited<ReturnType<typeof prisma.serverConfig.findUnique>> | null = null
  let groups: PGroup[] = []
  try { await ensureServerConfigSchema() } catch {}
  try {
    config = await prisma.serverConfig.findUnique({ where: { id: 'singleton' } })
  } catch { config = null }
  try {
    groups = await prisma.serverConfigGroup.findMany({
      orderBy: { order: 'asc' },
      include: { items: { where: { isPublic: true }, orderBy: { order: 'asc' } } },
    }) as unknown as PGroup[]
  } catch { groups = [] }
  return { config, groups }
}

export default async function ConfigurationPage() {
  const { config, groups } = await getData()
  const status = STATUS[(config?.status as string) ?? 'preparation'] ?? STATUS.preparation
  const ip = config?.serverIp ? `${config.serverIp}${config.serverPort ? `:${config.serverPort}` : ''}` : null
  const filled = groups.filter(g => g.items.length > 0)

  return (
    <div className="min-h-screen">
      <PageHero
        badge="🖥️ Serveur"
        title="Configuration"
        subtitle={config?.description || 'Toute la configuration de Voilectia ECO : monde, progression, economie, gameplay et connexion.'}
      >
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
          style={{ color: status.color, background: status.bg, border: `1px solid ${status.color}40` }}
        >
          ● {status.label}{config?.season ? ` · ${config.season}` : ''}
        </span>
      </PageHero>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-10">

        {(filled.length > 0 || ip) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filled.map(g => (
              <div key={g.id} className="card p-6">
                <h2 className="font-display text-lg font-bold text-[#1A3D2B] mb-4 flex items-center gap-2">
                  {g.icon && <span className="text-xl">{g.icon}</span>}{g.title}
                </h2>
                <div className="divide-y divide-[#EDE3CC]">
                  {g.items.map(it => (
                    <div key={it.id} className="py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[#4A6854] text-sm flex items-center gap-2">
                          {it.icon && <span>{it.icon}</span>}{it.label}
                        </span>
                        <span className="text-[#1A3D2B] font-semibold text-sm text-right">{it.value}</span>
                      </div>
                      {it.description && (
                        <p className="text-xs text-[#6B8C6A] mt-1 leading-snug">{it.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {ip && (
              <div className="card p-6">
                <h2 className="font-display text-lg font-bold text-[#1A3D2B] mb-4 flex items-center gap-2">
                  <Plug size={18} className="text-[#52B788]" /> Connexion
                </h2>
                <div className="bg-[#F7F0DF] border border-[#DBCAA8] rounded-xl p-4 flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <code className="font-mono font-bold text-[#1A3D2B] text-lg break-all">{ip}</code>
                  <CopyButton text={ip} />
                </div>
                <div className="divide-y divide-[#EDE3CC]">
                  {config?.ecoVersion && (
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-[#4A6854] text-sm">Version Eco</span>
                      <span className="text-[#1A3D2B] font-semibold text-sm">{config.ecoVersion}</span>
                    </div>
                  )}
                  {config?.modpack && (
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-[#4A6854] text-sm">Modpack</span>
                      <span className="text-[#1A3D2B] font-semibold text-sm">{config.modpack}</span>
                    </div>
                  )}
                  {config?.maxPlayers && (
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-[#4A6854] text-sm">Capacite</span>
                      <span className="text-[#1A3D2B] font-semibold text-sm">{config.maxPlayers} joueurs</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {(config?.startDate || config?.endDate) && (
          <section className="card p-6">
            <h2 className="font-display text-lg font-bold text-[#1A3D2B] mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-[#52B788]" /> Saison {config?.season}
            </h2>
            <div className="flex gap-10 flex-wrap">
              {config?.startDate && (
                <div>
                  <div className="text-xs text-[#6B8C6A] uppercase tracking-wide mb-1">Ouverture</div>
                  <div className="font-bold text-[#1A3D2B]">{new Date(config.startDate).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</div>
                </div>
              )}
              {config?.endDate && (
                <div>
                  <div className="text-xs text-[#6B8C6A] uppercase tracking-wide mb-1">Fin estimee</div>
                  <div className="font-bold text-[#1A3D2B]">{new Date(config.endDate).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</div>
                </div>
              )}
            </div>
          </section>
        )}

        {filled.length === 0 && !ip && (
          <div className="card p-10 text-center text-[#6B8C6A]">
            La configuration sera bientot disponible.
          </div>
        )}

        <div className="text-center pt-2">
          <Link href="/progression" className="btn-primary mr-3">Progression des metiers</Link>
          <Link href="/presentation" className="btn-outline">Presentation du serveur</Link>
        </div>
      </div>
    </div>
  )
}
