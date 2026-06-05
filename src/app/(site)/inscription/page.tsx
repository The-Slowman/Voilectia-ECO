'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, UserCircle, Gamepad2, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InscriptionPage() {
  const router = useRouter()
  const [form,    setForm]    = useState({ username: '', email: '', password: '', ecoName: '', discordTag: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Mot de passe trop court (min. 6 caractères).'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/player/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur lors de l\'inscription.'); return }
      toast.success('Compte créé ! Bienvenue sur Voilectia 🌿')
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
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1A3D2B] flex items-center justify-center mx-auto mb-4">
            <UserCircle size={28} className="text-[#52B788]" />
          </div>
          <h1 className="font-display font-bold text-3xl text-[#1A3D2B] mb-1">Créer un compte</h1>
          <p className="text-[#4A6854] text-sm">Rejoins la communauté Voilectia</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D5A3F] mb-1.5">
                  Pseudo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5F4A]" />
                  <input type="text" required value={form.username}
                         onChange={e => update('username', e.target.value)}
                         placeholder="TonPseudo" className="input pl-9" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D5A3F] mb-1.5">
                  Pseudo Eco <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Gamepad2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5F4A]" />
                  <input type="text" required value={form.ecoName}
                         onChange={e => update('ecoName', e.target.value)}
                         placeholder="PseudoInGame" className="input pl-9" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D5A3F] mb-1.5">
                Adresse email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5F4A]" />
                <input type="email" required value={form.email}
                       onChange={e => update('email', e.target.value)}
                       placeholder="ton@email.com" className="input pl-9" autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D5A3F] mb-1.5">
                Mot de passe <span className="text-red-500">*</span>
                <span className="font-normal text-[#4A6854] ml-1">(min. 6 caractères)</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5F4A]" />
                <input type={showPwd ? 'text' : 'password'} required value={form.password}
                       onChange={e => update('password', e.target.value)}
                       placeholder="••••••••" className="input pl-9 pr-9" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D5F4A] hover:text-[#1A3D2B]">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D5A3F] mb-1.5">
                Tag Discord <span className="text-[#4A6854] font-normal">(optionnel)</span>
              </label>
              <div className="relative">
                <MessageCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D5F4A]" />
                <input type="text" value={form.discordTag}
                       onChange={e => update('discordTag', e.target.value)}
                       placeholder="TonPseudo#0000 ou @tonpseudo" className="input pl-9" />
              </div>
            </div>

            <button type="submit" disabled={loading}
                    className="btn-primary w-full justify-center py-3 disabled:opacity-60 mt-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Création...</>
              ) : (
                <>🌿 Créer mon compte</>
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[var(--color-border)] mt-4">
            <p className="text-sm text-[#4A6854]">
              Déjà un compte ?{' '}
              <Link href="/connexion" className="font-semibold text-[#2D6A4F] hover:text-[#1A3D2B] transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
