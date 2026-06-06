import Link from 'next/link'

interface AdminEmptyStateProps {
  icon?:     string
  title:     string
  desc?:     string
  action?:   { label: string; href?: string; onClick?: () => void }
}

export function AdminEmptyState({ icon = '📭', title, desc, action }: AdminEmptyStateProps) {
  return (
    <div className="adm-empty">
      <div className="adm-empty-icon">{icon}</div>
      <div className="adm-empty-title">{title}</div>
      {desc && <div className="adm-empty-desc" style={{ marginBottom: action ? 16 : 0 }}>{desc}</div>}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="adm-btn adm-btn-primary adm-btn-sm"
            style={{ marginTop: desc ? 0 : 12, textDecoration: 'none' }}
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="adm-btn adm-btn-primary adm-btn-sm"
            style={{ marginTop: desc ? 0 : 12 }}
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
