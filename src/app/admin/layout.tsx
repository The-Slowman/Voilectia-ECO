import './admin.css'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { AdminShell } from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const tok = cookies().get('voilectia_admin_session')?.value

  // Pas de token → middleware gère la redirection vers /admin/login
  if (!tok) {
    return <>{children}</>
  }

  // ⚠️ SÉCURITÉ : Utilise adminToken exclusivement (pas playerToken)
  const user = await prisma.user.findFirst({
    where:  { adminToken: tok, role: { not: 'PLAYER' } },
    select: { name: true, email: true, role: true },
  }).catch(() => null)

  if (!user) {
    return <>{children}</>
  }

  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }}>
      {children}
    </AdminShell>
  )
}
