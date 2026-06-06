'use client'

import { useState, useEffect } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader }  from './AdminHeader'

export type AdminTheme = 'dark' | 'light'

interface AdminShellProps {
  user:     { name: string; email: string; role: string }
  children: React.ReactNode
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [theme,            setTheme]            = useState<AdminTheme>('dark')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mounted,          setMounted]          = useState(false)

  // Hydratation sans flash
  useEffect(() => {
    const saved = localStorage.getItem('adm-theme') as AdminTheme | null
    if (saved === 'light' || saved === 'dark') setTheme(saved)
    setMounted(true)
  }, [])

  function toggleTheme() {
    const next: AdminTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('adm-theme', next)
  }

  // Fermer sidebar mobile au resize
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setMobileSidebarOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Fermer avec Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileSidebarOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      className={`admin-panel${theme === 'light' ? ' adm-light' : ''} min-h-screen flex`}
      style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.1s' }}
    >
      {/* Overlay mobile */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        user={user}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          user={user}
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleMobileSidebar={() => setMobileSidebarOpen(p => !p)}
        />
        <main
          className="flex-1 overflow-auto"
          style={{ background: 'var(--adm-bg)', padding: '24px' }}
        >
          <div className="max-w-[1400px] mx-auto adm-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
