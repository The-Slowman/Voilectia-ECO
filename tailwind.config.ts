import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Palette officielle — pipettée depuis le logo Voilectia ──
        cream: {
          DEFAULT: '#F2E8D5', // fond du logo
          mid:     '#E8D9BF',
          deep:    '#DBCAA8',
          dark:    '#C9B48E',
        },
        forest: {
          DEFAULT: '#1A3D2B', // couleur exacte de "VOILECTIA" dans le logo
          dark:    '#1F4A33',
          mid:     '#2D6A4F',
          leaf:    '#3A7A52', // feuilles sombres du logo
          light:   '#52B878', // feuilles claires / réseau
          bright:  '#6FCF97',
        },
        gold: {
          DEFAULT: '#D4A820', // pièce du logo
          light:   '#E8C84A',
          pale:    '#FBF0C8',
          dark:    '#A07810',
        },
        ocean:  '#4A9EC4',   // bleu globe
        skin:   '#C9967A',   // ton chair des mains
        discord:'#5865F2',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cinzel)', 'Georgia', 'serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern':     "url('/images/hero-bg.jpg')",
        'leaf-pattern':     "url('/images/leaf-pattern.svg')",
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(82, 183, 136, 0.3)',
        'glow-gold':  '0 0 20px rgba(212, 160, 23, 0.3)',
        'card':       '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
