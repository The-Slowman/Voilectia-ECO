import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://voilectia.fr'

export const metadata: Metadata = {
  title: 'Voter pour Voilectia — Top-Serveur',
  description: "Soutenez Voilectia ECO en votant chaque jour sur les classements de serveurs. Gratuit, sans inscription, et ça aide énormément le serveur à grandir.",
  alternates: { canonical: `${SITE_URL}/vote` },
  openGraph: {
    url: `${SITE_URL}/vote`,
    title: 'Voter pour Voilectia ECO',
    description: 'Votez chaque jour pour soutenir le serveur — gratuit et sans inscription.',
    images: [{ url: `${SITE_URL}/images/og-default.jpg`, width: 1200, height: 630, alt: 'Voilectia ECO' }],
  },
}

export default function VoteLayout({ children }: { children: React.ReactNode }) {
  return children
}
