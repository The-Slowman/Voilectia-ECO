import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Map, ExternalLink, AlertCircle, Settings } from 'lucide-react'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const s = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } }).catch(() => null)
  return {
    title:       (s?.ecoMapTitle ?? 'Site interne serveur') + ' — Voilectia ECO',
    description: 'Accédez au site interne du serveur Voilectia ECO directement depuis le site.',
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

  const enabled = settings?.ecoMapEnabled ?? false
  const mapUrl  = settings?.ecoMapUrl?.trim() ?? ''
  const title   = settings?.ecoMapTitle ?? 'Site interne serveur'

  // Normaliser l'URL (ajouter http:// si absent)
  const normalizedUrl = mapUrl && !mapUrl.startsWith('http')
    ? `http://${mapUrl}`
    : mapUrl

  const isConfigured = enabled && normalizedUrl.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>

      {/* Barre supérieure */}
      <div style={{
        background: '#1A3D2B',
        borderBottom: '1px solid rgba(212,168,32,0.2)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 52,
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Map size={16} color="#52B788" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#F2E8D5', lineHeight: 1.2 }}>{title}</div>
            <div style={{ fontSize: 10, color: '#5A8A6A' }}>Voilectia ECO — Site interne</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isConfigured && (
            <>
              {/* Indicateur live */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#52B788',
                  boxShadow: '0 0 0 2px rgba(82,183,136,0.3)',
                  animation: 'pulse 2s infinite',
                }} />
                <span style={{ fontSize: 11, color: '#9DC4AD', fontWeight: 600 }}>En direct</span>
              </div>
              {/* Lien plein écran */}
              <a
                href={normalizedUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 12, color: '#9DC4AD', textDecoration: 'none',
                  padding: '5px 10px', borderRadius: 6,
                  border: '1px solid rgba(82,183,136,0.2)',
                  transition: 'color 0.15s',
                }}
              >
                <ExternalLink size={11} /> Plein écran
              </a>
            </>
          )}
        </div>
      </div>

      {/* Corps */}
      <div style={{ flex: 1, position: 'relative', background: '#0C1F14', overflow: 'hidden' }}>
        {!isConfigured ? (
          /* ── Placeholder non configuré ── */
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 20, padding: 24, textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'rgba(82,183,136,0.08)',
              border: '1px solid rgba(82,183,136,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Map size={28} color="#52B788" />
            </div>

            <div>
              <h2 style={{ fontWeight: 700, fontSize: 20, color: '#E8F5EE', marginBottom: 8 }}>
                Carte non configurée
              </h2>
              <p style={{ fontSize: 13, color: '#5A8A6A', maxWidth: 360, lineHeight: 1.6 }}>
                Le site interne du serveur n'est pas encore configuré. Un fondateur doit renseigner l'URL dans les paramètres admin.
              </p>
            </div>

            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              fontSize: 12, color: '#5A8A6A',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(82,183,136,0.1)',
              borderRadius: 12, padding: '12px 16px',
              maxWidth: 380, textAlign: 'left',
            }}>
              <Settings size={14} style={{ flexShrink: 0, marginTop: 1, color: '#52B788' }} />
              <span>
                <strong style={{ color: '#9DC4AD' }}>Admin → Paramètres → Site interne</strong>
                <br />Activez et entrez l'URL complète du site interne du serveur.
              </span>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 11, color: '#5A8A6A',
              background: 'rgba(255,200,0,0.04)',
              border: '1px solid rgba(212,168,32,0.15)',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <AlertCircle size={13} style={{ color: '#D4A820', flexShrink: 0 }} />
              Le port de la carte Eco doit être ouvert dans le firewall du serveur de jeu.
            </div>
          </div>
        ) : (
          /* ── Iframe carte ── */
          <iframe
            src={normalizedUrl}
            title={title}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              border: 'none',
            }}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
            allowFullScreen
          />
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
