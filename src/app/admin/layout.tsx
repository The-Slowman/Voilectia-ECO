import './admin.css'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AdminShell } from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Pathname courant exposé par le middleware via x-pathname
  const pathname = headers().get('x-pathname') ?? ''
  const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login')

  const tok = cookies().get('voilectia_admin_session')?.value

  // Pas de token — la page login se rend sans shell, les autres sont protégées par middleware
  if (!tok) {
    return <>{children}</>
  }

  // ⚠️ SÉCURITÉ : Utilise adminToken exclusivement (pas playerToken)
  const user = await prisma.user.findFirst({
    where:  { adminToken: tok, role: { not: 'PLAYER' } },
    select: { name: true, email: true, role: true },
  }).catch(() => null)

  if (!user) {
    // Token présent mais invalide (token périmé, colonne manquante, erreur DB…)
    // → Renvoyer vers login pour ré-authentification, sauf si on y est déjà
    if (!isLoginPage) {
      redirect('/admin/login')
    }
    return <>{children}</>
  }

  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }}>
      {children}
    </AdminShell>
  )
}
