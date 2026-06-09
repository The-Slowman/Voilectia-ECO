// @ts-check
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const isDev = process.env.NODE_ENV === 'development'

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://cdn.discordapp.com https://i.imgur.com https://avatars.steamstatic.com https://steamcdn-a.akamaihd.net https://steamcommunity.com",
  "connect-src 'self'",
  "frame-src *",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://steamcommunity.com",
].join('; ')

const securityHeaders = [
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-XSS-Protection',         value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  ...(!isDev ? [{ key: 'Content-Security-Policy', value: CSP }] : []),
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'avatars.steamstatic.com' },
      { protocol: 'https', hostname: 'steamcdn-a.akamaihd.net' },
      { protocol: 'https', hostname: 'steamcommunity.com' },
    ],
    localPatterns: [
      { pathname: '/uploads/**' },
      { pathname: '/images/**' },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: isDev
        ? ['localhost:3000']
        : [process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') ?? ''],
    },
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  async redirects() {
    // Anciennes routes membre / communauté / villes → accueil (le Discord prend le relais)
    const toHome = [
      '/login', '/register', '/connexion', '/inscription',
      '/profile', '/profil', '/account', '/compte',
      '/messages', '/messagerie', '/members', '/membres', '/users',
      '/forum', '/forum/:path*',
      '/suggestions', '/suggestions/:path*',
      '/sondage', '/sondages',
      '/recrutement', '/contact',
      '/staff', '/federation', '/carte', '/soutenir',
      '/villes', '/villes/:path*', '/ville', '/cities', '/city', '/settlements',
    ]
    // Routes renommées (vitrine)
    const renamed = [
      { source: '/serveur',      destination: '/configuration', permanent: true },
      { source: '/top-serveur',  destination: '/vote',          permanent: true },
    ]
    return [
      ...toHome.map((source) => ({ source, destination: '/', permanent: false })),
      ...renamed,
    ]
  },
  webpack(config) {
    config.resolve.alias['@'] = join(__dirname, 'src')
    return config
  },
}

export default nextConfig
