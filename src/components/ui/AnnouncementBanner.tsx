import { prisma } from '@/lib/db'

/**
 * Bandeau d'annonce global — rendu côté serveur.
 * Affiché en haut du site public si announcementEnabled = true et announcementText non vide.
 */
export async function AnnouncementBanner() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where:  { id: 'singleton' },
      select: { announcementEnabled: true, announcementText: true },
    })

    if (!settings?.announcementEnabled || !settings.announcementText?.trim()) {
      return null
    }

    return (
      <div
        className="fixed top-0 left-0 right-0 z-[52] h-10 flex items-center justify-center
                   bg-[#D4A820] text-[#1A3D2B] text-center text-sm font-semibold
                   px-4 leading-snug"
        role="banner"
      >
        {settings.announcementText}
      </div>
    )
  } catch {
    return null
  }
}
