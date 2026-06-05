'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Upload, Image as ImageIcon, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Media {
  id: string; filename: string; url: string; mimeType: string
  size: number; alt: string | null; folder: string; createdAt: string
}

export default function AdminMediasPage() {
  const [medias,    setMedias]    = useState<Media[]>([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copied,    setCopied]    = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/medias').then(r => r.json()).catch(() => [])
    setMedias(Array.isArray(r) ? r : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) { toast.success('Fichier uploadé'); load() }
    else toast.error('Erreur upload')
    setUploading(false)
    e.target.value = ''
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ?')) return
    await fetch(`/api/medias/${id}`, { method: 'DELETE' })
    toast.success('Supprimé'); load()
  }

  function copyUrl(url: string, id: string) {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatSize = (bytes: number) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} Ko`
    : `${(bytes / 1024 / 1024).toFixed(1)} Mo`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-[#E8F5EE] flex items-center gap-2">
          <ImageIcon size={22} /> Médias
        </h1>
        <label className={`flex items-center gap-2 bg-[#3A7A52] hover:bg-[#2D6A4F] text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${uploading ? 'opacity-60' : ''}`}>
          <Upload size={16} /> {uploading ? 'Upload…' : 'Uploader'}
          <input type="file" accept="image/*,video/*,.pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="text-[#9DC4AD] text-center py-8">Chargement…</div>
      ) : medias.length === 0 ? (
        <div className="text-center text-[#9DC4AD] py-16">
          <ImageIcon size={36} className="mx-auto mb-3 opacity-30" />
          <p>Aucun média uploadé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {medias.map(m => (
            <div key={m.id} className="bg-[#111F18] border border-[rgba(82,183,136,0.1)] rounded-xl overflow-hidden group">
              {m.mimeType.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.alt ?? m.filename} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center text-[#5A8A6A] bg-[rgba(82,183,136,0.05)]">
                  <ImageIcon size={32} />
                </div>
              )}
              <div className="p-2">
                <p className="text-[10px] text-[#9DC4AD] truncate">{m.filename}</p>
                <p className="text-[10px] text-[#5A8A6A]">{formatSize(m.size)}</p>
                <div className="flex gap-1 mt-1.5">
                  <button onClick={() => copyUrl(m.url, m.id)}
                          className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1 rounded bg-[rgba(82,183,136,0.08)] text-[#9DC4AD] hover:text-[#52B788]">
                    {copied === m.id ? <Check size={11} /> : <Copy size={11} />}
                    {copied === m.id ? 'Copié' : 'URL'}
                  </button>
                  <button onClick={() => handleDelete(m.id)}
                          className="p-1 rounded bg-[rgba(248,113,113,0.08)] text-[#5A8A6A] hover:text-red-400">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
