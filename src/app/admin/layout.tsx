import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const tok = cookies().get('voilectia_admin_session')?.value

  if (!tok) redirect('/admin/login')

  const user = await prisma.user.findFirst({
    where:   { playerToken: tok, role: { not: 'PLAYER' } },
    include: { rank: true },
  })

  if (!user) redirect('/admin/login')

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
