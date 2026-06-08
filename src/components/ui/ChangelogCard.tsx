import { Calendar } from 'lucide-react'
import { formatDate, CHANGELOG_TYPES } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitize'

interface ChangelogCardProps {
  entry: {
    id:           string
    version:      string
    title:        string
    content:      string
    season:       string
    type:         string
    publishedAt?: Date | string | null
    createdAt:    Date | string
    author:       { name: string }
  }
  compact?: boolean
}

/** Couleurs exactes palette logo — sur fond blanc/crème */
const TYPE_STYLES: Record<string, { badge: string; border: string }> = {
  major:   { badge: 'bg-[var(--gold-pale)] text-[#A07810] border-[rgba(212,168,32,0.35)]', border: 'border-l-[#D4A820]' },
  update:  { badge: 'bg-[rgba(58,122,82,0.1)] text-[#2D6A4F] border-[rgba(58,122,82,0.3)]',  border: 'border-l-[#3A7A52]' },
  hotfix:  { badge: 'bg-red-50 text-red-700 border-red-200',                                   border: 'border-l-red-500' },
  content: { badge: 'bg-[rgba(74,158,196,0.1)] text-[#1A6A8A] border-[rgba(74,158,196,0.3)]', border: 'border-l-[#4A9EC4]' },
}

export function ChangelogCard({ entry, compact = false }: ChangelogCardProps) {
  const styles = TYPE_STYLES[entry.type] ?? TYPE_STYLES.update
  const label  = CHANGELOG_TYPES[entry.type]?.label ?? entry.type

  return (
    <div className={cn(
      'bg-white border border-[#DBCAA8] border-l-4 rounded-r-xl p-5',
      'transition-all hover:border-[#D4A820] hover:shadow-sm',
      styles.border
    )}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-bold text-[#1A3D2B] text-sm">
            v{entry.version}
          </span>
          <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border',
            styles.badge
          )}>
            {label}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px]
                           bg-[#F2E8D5] text-[#6B8C6A] border border-[#DBCAA8]">
            Saison {entry.season}
          </span>
        </div>
        <div className="text-right text-xs text-[#9AB09A] whitespace-nowrap flex-shrink-0">
          <Calendar size={11} className="inline mr-1" />
          {formatDate(entry.publishedAt ?? entry.createdAt)}
        </div>
      </div>

      <h3 className="font-semibold text-[#1A3D2B] text-sm md:text-base mb-2">
        {entry.title}
      </h3>

      {!compact && (
        <div
          className="rich-content text-sm"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(entry.content) }}
        />
      )}
    </div>
  )
}
