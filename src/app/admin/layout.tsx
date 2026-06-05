import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const tok = cookies().get('voilectia_admin_session')?.value

  // Pas de cookie → le middleware gère la redirection vers /admin/login.
  // Si on est déjà sur /admin/login, on rend juste le children (la page de login).
  if (!tok) {
    return <>{children}</>
  }

  const user = await prisma.user.findFirst({
    where:   { playerToken: tok, role: { not: 'PLAYER' } },
    include: { rank: true },
  }).catch(() => null)

  // Token invalide → rend juste le children (le middleware redirigera)
  if (!user) {
    return <>{children}</>
  }

  const sessionUser = { name: user.name, email: user.email, role: user.role }

  return (
    <div className="min-h-screen bg-[#071A0F] flex">
      <AdminSidebar user={sessionUser} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={sessionUser} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
