// @ts-check

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
}

export default nextConfig
