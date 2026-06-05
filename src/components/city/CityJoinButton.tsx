'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserPlus } from 'lucide-react'

interface Props {
  cityId:      string
  cityName:    string
  accentColor: string
  compact?:    boolean
}

export function CityJoinButton({ cityName, accentColor, compact = false }: Props) {
  const pathname = usePathname()
  // Extrait le slug de l'URL courante /villes/[slug]
  const slug = pathname.split('/')[2] ?? ''

  if (compact) {
    return (
      <Link
        href={`/villes/${slug}/rejoindre`}
        className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full
                   text-white transition-opacity hover:opacity-80"
        style={{ background: accentColor }}
      >
        <UserPlus size={10} /> Rejoindre
      </Link>
    )
  }

  return (
    <Link
      href={`/villes/${slug}/rejoindre`}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                 text-white transition-opacity hover:opacity-80"
      style={{ background: accentColor }}
    >
      <UserPlus size={15} />
      Rejoindre {cityName}
    </Link>
  )
}
