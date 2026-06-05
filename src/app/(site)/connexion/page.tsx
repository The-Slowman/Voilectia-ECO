'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ConnexionPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/player/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Identifiants invalides.')
        return
      }
      toast.success(`Bienvenue, ${data.username} !`)
      router.push('/profil')
      router.refresh()
    } catch {
      toast.error('Erreur réseau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F2E8D5] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1A3D2B] flex items-center justify-center mx-auto mb-4">
            <LogIn size={28} className="text-[#52B788]" />
          </div>
          <h1 className="font-display font-bold text-3xl text-[#1A3D2B] mb-1">Connexion</h1>
          <p className="text-[#4A6854] text-sm">Accède à ton espace Voilectia</p>
        </div>

        <div className="card p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2D5A3F] mb-1.5">Adresse email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5F4A]" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                       placeholder="ton@email.com" className="input pl-9" autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D5A3F] mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5F4A]" />
                <input type={showPwd ? 'text' : 'password'} required value={password}
                       onChange={e => setPassword(e.target.value)}
                       placeholder="••••••••" className="input pl-9 pr-9" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D5F4A] hover:text-[#1A3D2B]">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
                    className="btn-primary w-full justify-center py-3 disabled:opacity-60">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Connexion...</>
              ) : (
                <><LogIn size={16} /> Se connecter</>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[var(--color-border)]">
            <p className="text-sm text-[#4A6854]">
              Pas encore de compte ?{' '}
              <Link href="/inscription" className="font-semibold text-[#2D6A4F] hover:text-[#1A3D2B] transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
