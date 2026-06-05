import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'
import { prisma } from '@/lib/db'
import { Users, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Staff',
  description: 'Rencontrez l\'équipe Voilectia — les personnes qui font vivre le serveur au quotidien.',
}

export const revalidate = 300

export default async function StaffPage() {
  const staffMembers = await prisma.staffMember.findMany({
    where:   { active: true },
    orderBy: { order: 'asc' },
  })

  return (
    <div>
      <PageHero
        title="Notre Staff"
        subtitle="L'équipe derrière Voilectia — passionnés, disponibles et dévoués à la communauté."
        badge="👥 L'équipe"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {staffMembers.length === 0 ? (
          <div className="card p-12 text-center">
            <Users size={40} className="text-[#3D5F4A] mx-auto mb-4" />
            <p className="text-[#4A6854]">L'équipe sera présentée prochainement.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {staffMembers.map((member) => (
              <div key={member.id} className="card-hover p-6 text-center group">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  {member.avatar ? (
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      fill
                      className="object-cover rounded-full ring-2 ring-[rgba(82,183,136,0.2)] group-hover:ring-[#52B788] transition-all"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[rgba(82,183,136,0.1)] flex items-center justify-center ring-2 ring-[rgba(82,183,136,0.2)] group-hover:ring-[#52B788] transition-all">
                      <span className="text-3xl text-[#52B788] font-display font-bold">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-display font-bold text-[#1A3D2B] text-base mb-1">
                  {member.name}
                </h3>
                <span className="badge-green text-[10px] mb-3 inline-flex">
                  {member.role}
                </span>
                {member.description && (
                  <p className="text-[#4A6854] text-xs leading-relaxed">
                    {member.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Recrutement */}
        <div className="card p-8 text-center border border-[rgba(212,160,23,0.2)]">
          <div className="text-4xl mb-4">🌟</div>
          <h2 className="font-display text-2xl font-bold text-[#1A3D2B] mb-3">
            Rejoindre le Staff
          </h2>
          <p className="text-[#4A6854] text-sm mb-6 max-w-lg mx-auto leading-relaxed">
            Vous souhaitez contribuer à Voilectia en tant que modérateur, helper ou animateur ?
            Nous cherchons régulièrement des membres impliqués et bienveillants.
            Consultez les annonces de recrutement sur notre Discord.
          </p>
          <a
            href={process.env.NEXT_PUBLIC_DISCORD_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex"
          >
            Candidater sur Discord
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
