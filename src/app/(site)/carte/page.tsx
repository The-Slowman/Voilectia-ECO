import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Map, ExternalLink, AlertCircle } from 'lucide-react'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const s = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
  return {
    title:       s?.ecoMapTitle ?? 'Carte du monde',
    description: 'Explorez la carte interactive du serveur Voilectia ECO en temps réel.',
  }
}

async function getMapSettings() {
  try {
    return await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
  } catch {
    return null
  }
}

export default async function CartePage() {
  const settings = await getMapSettings()

  const enabled  = settings?.ecoMapEnabled ?? false
  const mapUrl   = settings?.ecoMapUrl     ?? ''
  const title    = settings?.ecoMapTitle   ?? 'Carte du monde'

  return (
    <div className="flex flex-col" style={{ height: '100vh' }}>

      {/* Barre supérieure */}
      <div className="bg-[#1A3D2B] border-b border-[rgba(212,168,32,0.2)] px-4 sm:px-6
                      flex items-center justify-between h-14 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Map size={18} className="text-[#52B788]" />
          <div>
            <h1 className="font-display font-bold text-sm text-[#F2E8D5]">{title}</h1>
            <p className="text-[10px] text-[#5A8A6A]">Voilectia ECO — Carte interactive</p>
          </div>
        </div>
        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-1.5 text-xs text-[#9DC4AD] hover:text-[#F2E8D5] transition-colors">
            <ExternalLink size={12} /> Ouvrir en plein écran
          </a>
        )}
      </div>

      {/* Iframe ou placeholder */}
      <div className="flex-1 relative bg-[#0C1F14]">
        {!enabled || !mapUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(82,183,136,0.1)] border border-[rgba(82,183,136,0.2)]
                            flex items-center justify-center">
              <Map size={28} className="text-[#52B788]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-[#E8F5EE] mb-2">
                Carte non configurée
              </h2>
              <p className="text-[#5A8A6A] text-sm max-w-sm">
                La carte du serveur n'est pas encore disponible. Un fondateur doit configurer l'URL dans{' '}
                <code className="bg-[rgba(255,255,255,0.08)] px-1.5 py-0.5 rounded text-[#52B788]">
                  Admin → Paramètres → Carte Eco
                </code>.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#5A8A6A] bg-[rgba(255,255,255,0.04)]
                            border border-[rgba(82,183,136,0.1)] rounded-xl px-4 py-3 max-w-sm">
              <AlertCircle size={14} className="flex-shrink-0" />
              Le port 3001 du serveur Eco doit être ouvert publiquement.
            </div>
          </div>
        ) : (
          <>
            <iframe
              src={mapUrl}
              title={title}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
            {/* Overlay info en bas de la carte */}
            <div className="absolute bottom-4 left-4 bg-[rgba(12,31,20,0.85)] backdrop-blur-sm
                            border border-[rgba(82,183,136,0.2)] rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
              <span className="text-[10px] font-semibold text-[#9DC4AD]">Carte en direct</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
