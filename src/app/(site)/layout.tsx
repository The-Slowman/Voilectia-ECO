import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AnnouncementBanner } from '@/components/ui/AnnouncementBanner'
import { prisma } from '@/lib/db'

// Force dynamic rendering — prevents SSG from querying DB at build time
export const dynamic = 'force-dynamic'

async function getBannerActive(): Promise<boolean> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where:  { id: 'singleton' },
      select: { announcementEnabled: true, announcementText: true },
    })
    return !!(settings?.announcementEnabled && settings.announcementText?.trim())
  } catch {
    return false
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const hasBanner = await getBannerActive()

  return (
    <>
      {/*
        AnnouncementBanner est fixed top-0 z-[52] (h-10 = 40px).
        Header est fixed z-50 — top-0 sans bannière, top-10 avec bannière.
        Le menu mobile s'ouvre à partir du bas du header (top = 64px ou 104px).
        Le <main> reçoit pt-16 (header seul) — le bandeau fixed ne pousse pas le contenu.
        Les PageHero utilisent pt-32 (128px) ce qui couvre header+banner même sur mobile.
      */}
      <AnnouncementBanner />
      <Header hasBanner={hasBanner} />
      {/* pt-16 = hauteur header (64px) sans bannière ; pt-[104px] = banner(40px) + header(64px) */}
      <main className={`min-h-screen ${hasBanner ? 'pt-[104px]' : 'pt-16'}`}>
        {children}
      </main>
      <Footer />
    </>
  )
}
