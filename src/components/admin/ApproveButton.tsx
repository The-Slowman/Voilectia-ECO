'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface ApproveButtonProps {
  id:       string
  endpoint: string
  approved: boolean
}

export function ApproveButton({ id, endpoint, approved }: ApproveButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ approved: !approved }),
      })
      if (!res.ok) throw new Error()
      toast.success(approved ? 'Masqué' : 'Publié !')
      router.refresh()
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={approved ? 'Masquer' : 'Approuver'}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
        approved
          ? 'text-[#9AB09A] hover:bg-orange-50 hover:text-orange-500'
          : 'text-[#9AB09A] hover:bg-[rgba(58,122,82,0.1)] hover:text-[#3A7A52]'
      }`}
    >
      {loading
        ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin block" />
        : approved ? <X size={14} /> : <Check size={14} />}
    </button>
  )
}
