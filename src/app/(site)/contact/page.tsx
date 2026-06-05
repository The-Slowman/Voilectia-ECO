'use client'

import { useState } from 'react'
import { PageHero } from '@/components/ui/PageHero'
import { Send, ExternalLink, MessageCircle, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form,     setForm]     = useState({ name: '', email: '', subject: '', message: '' })
  const [loading,  setLoading]  = useState(false)
  const [sent,     setSent]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSent(true)
      toast.success('Message envoyé avec succès !')
    } catch {
      toast.error('Erreur lors de l\'envoi. Réessayez ou contactez-nous sur Discord.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHero
        title="Contact"
        subtitle="Une question, un problème ou une suggestion ? Contactez l'équipe Voilectia."
        badge="✉️ Nous écrire"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Infos contact */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <h3 className="font-display font-semibold text-[#1A3D2B] mb-4">Nous rejoindre</h3>
              <div className="space-y-3">
                <a
                  href={process.env.NEXT_PUBLIC_DISCORD_URL || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/20 hover:bg-[#5865F2]/20 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#5865F2] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054A19.9 19.9 0 0 0 5.93 21.19a.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A3D2B] text-sm">Discord communautaire</p>
                    <p className="text-[#4A6854] text-xs">Meilleure façon de nous contacter</p>
                  </div>
                  <ExternalLink size={14} className="text-[#3D5F4A] ml-auto" />
                </a>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(82,183,136,0.06)] border border-[rgba(82,183,136,0.1)]">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(82,183,136,0.1)] flex items-center justify-center flex-shrink-0 text-[#52B788]">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A3D2B] text-sm">Email</p>
                    <p className="text-[#4A6854] text-xs">contact@voilectia.fr</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-[#1A3D2B] text-sm mb-3">Tickets Discord</h3>
              <p className="text-[#4A6854] text-xs leading-relaxed mb-3">
                Pour un signalement, une aide in-game ou une demande officielle, utilisez les tickets Discord :
              </p>
              <ul className="space-y-1.5 text-xs text-[#4A6854]">
                {['🆘 Support technique', '⚖️ Signalement', '🏛️ Demande Fédération', '🔨 Bug report'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#52B788]" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="card p-10 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="font-display font-bold text-[#E8F5EE] text-xl mb-2">Message envoyé !</h3>
                <p className="text-[#9DC4AD] text-sm">
                  Nous vous répondrons dans les meilleurs délais. Pour une réponse rapide, rejoignez notre Discord.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                <h3 className="font-display font-semibold text-[#1A3D2B] mb-2">Envoyer un message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2D5A3F] mb-1.5">Nom *</label>
                    <input
                      type="text" required value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Votre nom"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2D5A3F] mb-1.5">Email *</label>
                    <input
                      type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="votre@email.fr"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9DC4AD] mb-1.5">Sujet *</label>
                  <input
                    type="text" required value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Sujet de votre message"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9DC4AD] mb-1.5">Message *</label>
                  <textarea
                    required rows={5} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Votre message..."
                    className="input resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Envoyer le message
                    </>
                  )}
                </button>

                <p className="text-[#3D5F4A] text-xs text-center">
                  Pour une réponse plus rapide, préférez le Discord.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
