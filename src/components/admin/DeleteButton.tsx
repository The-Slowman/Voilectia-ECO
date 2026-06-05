'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface DeleteButtonProps {
  id:       string
  endpoint: string
  label?:   string
}

export function DeleteButton({ id, endpoint, label }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Supprimé avec succès')
      router.refresh()
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-900/20 border border-red-500/20 disabled:opacity-50"
        >
          {loading ? '...' : 'Confirmer'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-[#9DC4AD] hover:text-[#E8F5EE] px-1.5 py-1 rounded"
        >
          Annuler
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded-lg text-[#9DC4AD] hover:text-red-400 hover:bg-red-900/20 transition-colors"
      title="Supprimer"
    >
      <Trash2 size={14} />
    </button>
  )
}
