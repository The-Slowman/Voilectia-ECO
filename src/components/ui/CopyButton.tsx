'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }

  return (
    <button
      onClick={copy}
      title="Copier"
      className={className ?? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#52B788] hover:bg-[#3A7A52] text-white transition-colors'}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copié !' : 'Copier'}
    </button>
  )
}
