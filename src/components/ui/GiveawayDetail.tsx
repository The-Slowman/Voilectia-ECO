'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Gift, Trophy, Users, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface GiveawayDetailProps {
  giveaway: {
    id: string; title: string; description: string; prize: string
    image: string | null; endDate: Date | string; ended: boolean; winnerName: string | null
    _count: { entries: number }
  }
}

export function GiveawayDetail({ giveaway }: GiveawayDetailProps) {
  const [form,     setForm]     = useState({ playerName: '', discordTag: '', email: '' })
  const [loading,  setLoading]  = useState(false)
  const [entered,  setEntered]  = useState(false)

  const now      = new Date()
  const isActive = !giveaway.ended && new Date(giveaway.endDate) > now

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.playerName.trim()) { toast.error('Pseudo requis'); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/giveaways/${giveaway.id}/enter`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setEntered(true)
        toast.success('🎉 Tu participes ! Bonne chance !')
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Erreur')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-texture">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        <Link href="/giveaways" className="inline-flex items-center gap-2 text-[#6B8C6A] hover:text-[#1A3D2B] text-sm mb-8 transition-colors">
          <ArrowLeft size={14} /> Tous les giveaways
        </Link>

        {/* Header */}
        {giveaway.image && (
          <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
            <Image src={giveaway.image} alt={giveaway.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A3D2B]/70 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h1 className="font-display text-3xl font-black text-white">{giveaway.title}</h1>
            </div>
          </div>
        )}

        {!giveaway.image && (
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(212,168,32,0.1)] border border-[rgba(212,168,32,0.2)] flex items-center justify-center">
              <Gift size={28} className="text-[#D4A820]" />
            </div>
            <h1 className="font-display text-3xl font-black text-[#1A3D2B]">{giveaway.title}</h1>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-4 text-center">
            <Trophy size={20} className="text-[#D4A820] mx-auto mb-1" />
            <div className="font-bold text-[#1A3D2B] text-sm">{giveaway.prize}</div>
            <div className="text-[10px] text-[#6B8C6A] uppercase tracking-wide mt-0.5">Prix</div>
          </div>
          <div className="card p-4 text-center">
            <Users size={20} className="text-[#52B788] mx-auto mb-1" />
            <div className="font-bold text-[#1A3D2B] text-sm">{giveaway._count.entries}</div>
            <div className="text-[10px] text-[#6B8C6A] uppercase tracking-wide mt-0.5">Participants</div>
          </div>
          <div className="card p-4 text-center">
            <Clock size={20} className={`mx-auto mb-1 ${isActive ? 'text-[#52B788]' : 'text-[#9AB09A]'}`} />
            <div className={`font-bold text-sm ${isActive ? 'text-[#1A3D2B]' : 'text-[#9AB09A]'}`}>
              {giveaway.ended ? 'Terminé' :
                new Date(giveaway.endDate) <= now ? 'Expiré' :
                new Date(giveaway.endDate).toLocaleDateString('fr-FR')}
            </div>
            <div className="text-[10px] text-[#6B8C6A] uppercase tracking-wide mt-0.5">Fin</div>
          </div>
        </div>

        {/* Description */}
        <div className="card p-6 mb-8">
          <p className="text-[#2D5A3F] leading-relaxed whitespace-pre-wrap">{giveaway.description}</p>
        </div>

        {/* Gagnant */}
        {giveaway.ended && giveaway.winnerName && (
          <div className="card p-6 mb-8 border-[rgba(212,168,32,0.4)] bg-[rgba(212,168,32,0.05)] text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="font-display text-2xl font-bold text-[#1A3D2B] mb-1">Félicitations !</h2>
            <p className="text-[#6B8C6A] mb-2">Le gagnant de ce giveaway est :</p>
            <p className="font-display font-black text-3xl text-[#D4A820]">{giveaway.winnerName}</p>
          </div>
        )}

        {/* Formulaire de participation */}
        {isActive && !entered && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-[#1A3D2B] text-xl mb-4">
              Participer au tirage
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2D5A3F] mb-1.5">
                  Pseudo Eco ou Discord <span className="text-red-500">*</span>
                </label>
                <input required value={form.playerName}
                       onChange={e => setForm(p => ({ ...p, playerName: e.target.value }))}
                       className="input w-full" placeholder="MonPseudo" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2D5A3F] mb-1.5">Tag Discord</label>
                <input value={form.discordTag}
                       onChange={e => setForm(p => ({ ...p, discordTag: e.target.value }))}
                       className="input w-full" placeholder="@MonPseudo" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2D5A3F] mb-1.5">
                  Email <span className="text-xs text-[#9AB09A]">(pour être notifié si vous gagnez)</span>
                </label>
                <input type="email" value={form.email}
                       onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                       className="input w-full" placeholder="email@exemple.fr" />
              </div>
              <button type="submit" disabled={loading}
                      className="w-full bg-[#D4A820] hover:bg-[#A07810] text-[#1A3D2B] font-bold py-3 rounded-xl text-base transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-[#1A3D2B] border-t-transparent rounded-full animate-spin" /> Envoi…</>
                ) : (
                  <><Gift size={16} /> Participer</>
                )}
              </button>
            </form>
          </div>
        )}

        {entered && (
          <div className="card p-8 text-center border-[rgba(82,183,136,0.3)] bg-[rgba(82,183,136,0.05)]">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="font-display font-bold text-[#1A3D2B] text-xl mb-2">Participation enregistrée !</h2>
            <p className="text-[#6B8C6A]">Bonne chance ! Le tirage aura lieu à la fin du giveaway.</p>
          </div>
        )}
      </div>
    </div>
  )
}
