import { cn } from '@/lib/utils'

interface PageHeroProps {
  title: string
  subtitle?: string
  badge?: string
  className?: string
  children?: React.ReactNode
}

/**
 * Hero de page — fond vert forêt profond (couleur logo),
 * ligne d'or en bas, typographie crème.
 */
export function PageHero({ title, subtitle, badge, className, children }: PageHeroProps) {
  return (
    <section className={cn('relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden', className)}>

      {/* Fond forêt avec radials subtils */}
      <div className="absolute inset-0 bg-[#1A3D2B]" />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212,168,32,0.10) 0%, transparent 55%)',
        }}
      />

      {/* Grille décorative */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'linear-gradient(rgba(242,232,213,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(242,232,213,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ligne or en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]
                      bg-gradient-to-r from-transparent via-[#D4A820] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {badge && (
          <div className="inline-flex items-center gap-2 mb-5
                          px-4 py-1.5 rounded-full border border-[rgba(212,168,32,0.35)]
                          bg-[rgba(212,168,32,0.1)] text-[#E8C84A] text-xs font-semibold
                          tracking-wider uppercase">
            {badge}
          </div>
        )}
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#F2E8D5] mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[rgba(242,232,213,0.55)] text-base md:text-lg max-w-2xl mx-auto
                        leading-relaxed italic"
             style={{ fontFamily: 'var(--font-lora)' }}>
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}

        {/* Séparateur or */}
        <div className="divider-gold mt-8" />
      </div>
    </section>
  )
}
