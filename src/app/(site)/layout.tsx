import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

// Force dynamic rendering — prevents SSG from querying DB at build time
export const dynamic = 'force-dynamic'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
