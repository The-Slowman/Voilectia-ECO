import Link from 'next/link'
import Image from 'next/image'
import { Gift, Clock, Users, Trophy } from 'lucide-react'

interface GiveawayCardProps {
  giveaway: {
    id: string; title: string; prize: string; image: string | null
    endDate: Date | string; ended: boolean; winnerName: string | null
    _count: { entries: number }
  }
}

function Countdown({ endDate }: { endDate: Date | string }) {
  const end  = new Date(endDate)
  const now  = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return <span className="text-red-400 text-xs font-semibold">Terminé</span>

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return <span className="text-[#52B788] text-xs font-semibold">⏱ {days}j {hours}h restants</span>
  if (hours > 0) return <span className="text-orange-400 text-xs font-semibold">⏱ {hours}h {minutes}min restants</span>
  return <span className="text-red-400 text-xs font-semibold animate-pulse">⏱ {minutes} minutes restantes</span>
}

export function GiveawayCard({ giveaway }: GiveawayCardProps) {
  return (
    <Link href={`/giveaways/${giveaway.id}`}>
      <div className="card card-hover group">
        {/* Image */}
        {giveaway.image && (
          <div className="relative h-40 rounded-t-2xl overflow-hidden">
            <Image src={giveaway.image} alt={giveaway.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A3D2B]/60 to-transparent" />
          </div>
        )}

        <div className="p-5">
          {!giveaway.image && (
            <div className="w-12 h-12 rounded-xl bg-[rgba(212,168,32,0.1)] border border-[rgba(212,168,32,0.2)] flex items-center justify-center mb-4">
              <Gift size={22} className="text-[#D4A820]" />
            </div>
          )}

          <h3 className="font-display font-bold text-[#1A3D2B] text-lg mb-1 group-hover:text-[#D4A820] transition-colors">
            {giveaway.title}
          </h3>

          <div className="flex items-center gap-1.5 mb-4">
            <Trophy size={13} className="text-[#D4A820]" />
            <span className="text-sm font-semibold text-[#A07810]">{giveaway.prize}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6B8C6A]">
            <span className="flex items-center gap-1">
              <Users size={12} /> {giveaway._count.entries} participant{giveaway._count.entries > 1 ? 's' : ''}
            </span>
            {giveaway.ended ? (
              <span className="text-[#6B8C6A]">Terminé</span>
            ) : (
              <Countdown endDate={giveaway.endDate} />
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
