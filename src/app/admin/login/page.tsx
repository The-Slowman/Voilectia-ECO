'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Identifiants invalides.')
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Erreur réseau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0C1F14] flex items-center justify-center px-4 bg-particles">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16">
              <Image src="/images/logo.png" alt="Voilectia" fill className="object-contain" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#E8F5EE] mb-1">Administration</h1>
          <p className="text-[#9DC4AD] text-sm">Voilectia ECO</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#4A6854] mb-1.5">Adresse email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5F4A]" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                       placeholder="admin@voilectia.fr" className="input pl-9" autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A6854] mb-1.5">Mot de passe</label>
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

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} className="flex-shrink-0" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
                    className="btn-primary w-full justify-center py-3 disabled:opacity-60">
              {loading
                ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Connexion...</>
                : <><Lock size={16} /> Se connecter</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-[#3D5F4A] text-xs mt-6">Accès réservé à l'équipe Voilectia</p>
      </div>
    </div>
  )
}
