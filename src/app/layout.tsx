import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://voilectia.fr'),
  title: {
    default:  'Voilectia ECO — Serveur Semi-RP Chill',
    template: '%s | Voilectia ECO',
  },
  description:
    'Serveur Eco français Semi-RP Chill — Économie, Coopération, Villes & Constructions. Rejoignez une communauté mature et bienveillante.',
  keywords: ['Eco', 'serveur', 'Semi-RP', 'Chill', 'Voilectia', 'VLC', 'coopération', 'économie'],
  authors: [{ name: 'Voilectia' }],
  openGraph: {
    type:        'website',
    locale:      'fr_FR',
    siteName:    'Voilectia ECO',
    title:       'Voilectia ECO — Serveur Semi-RP Chill',
    description: 'Serveur Eco français Semi-RP Chill — Économie, Coopération, Villes & Constructions.',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Voilectia ECO',
    description: 'Serveur Eco français Semi-RP Chill',
    images:      ['/images/og-default.jpg'],
  },
  robots: {
    index:  true,
    follow: true,
  },
  icons: {
    icon:  '/images/favicon.ico',
    apple: '/images/apple-touch-icon.png',
  },
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
