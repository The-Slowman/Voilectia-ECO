import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor:   '#1A3D2B',
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://voilectia.fr'
const OG_IMAGE = `${SITE_URL}/images/og-default.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  'Voilectia ECO — Serveur Semi-RP Chill Français',
    template: '%s — Voilectia ECO',
  },
  description:
    'Serveur Eco français Semi-RP Chill — Économie VLC, villes vivantes, coopération et constructions. Communauté mature et bienveillante.',
  keywords: [
    'Eco', 'serveur eco', 'Semi-RP', 'chill', 'Voilectia', 'VLC', 'coopération',
    'économie', 'villes', 'construction', 'serveur français', 'eco game',
  ],
  authors: [{ name: 'Voilectia', url: SITE_URL }],
  creator:   'Voilectia',
  publisher: 'Voilectia',
  openGraph: {
    type:        'website',
    locale:      'fr_FR',
    url:         SITE_URL,
    siteName:    'Voilectia ECO',
    title:       'Voilectia ECO — Serveur Semi-RP Chill Français',
    description: 'Serveur Eco français Semi-RP Chill — Économie VLC, villes vivantes, coopération et constructions.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Voilectia ECO' }],
  },
  twitter: {
    card:        'summary_large_image',
    site:        '@voilectia',
    title:       'Voilectia ECO — Serveur Semi-RP Chill',
    description: 'Serveur Eco français — Économie, coopération, villes vivantes.',
    images:      [OG_IMAGE],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    icon:  '/images/favicon.ico',
    apple: '/images/apple-touch-icon.png',
    shortcut: '/images/favicon.ico',
  },
  alternates: { canonical: SITE_URL },
  category: 'gaming',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F2E8D5] text-[#1A3D2B] antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111F18',
              color:       '#E8F5EE',
              border:      '1px solid rgba(82,183,136,0.2)',
            },
            success: { iconTheme: { primary: '#52B788', secondary: '#0C1F14' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#0C1F14' } },
          }}
        />
      </body>
    </html>
  )
}
