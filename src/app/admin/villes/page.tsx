'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Eye, EyeOff, Trash2, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface City {
  id:        string
  name:      string
  slug:      string
  mayor:     string
  biome:     string | null
  published: boolean
  order:     number
  accentColor: string | null
  _count:    { memberships: number; projects: number; announcements: number }
}

export default function AdminVillesPage() {
  const [cities,  setCities]  = useState<City[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetch('/api/cities').then(r => r.json()).catch(() => [])
    setCities(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function togglePublish(city: City) {
    await fetch(`/api/cities/${city.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ published: !city.published }),
    })
    toast.success(city.published ? 'Ville masquée' : 'Ville publiée')
    load()
  }

  async function handleDelete(city: City) {
    if (!confirm(`Supprimer "${city.name}" ? Cette action est irréversible.`)) return
    await fetch(`/api/cities/${city.id}`, { method: 'DELETE' })
    toast.success('Ville supprimée')
    load()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A3D2B]">Villes</h1>
          <p className="text-[#6B8C6A] text-sm">{cities.length} ville{cities.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/villes/nouveau" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Nouvelle ville
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#F2E8D5] rounded-xl animate-pulse" />)}
        </div>
      ) : cities.length === 0 ? (
        <div className="bg-white border border-[#DBCAA8] rounded-xl p-12 text-center">
          <Building2 size={36} className="text-[#9AB09A] mx-auto mb-3" />
          <p className="text-[#9AB09A] mb-4">Aucune ville créée.</p>
          <Link href="/admin/villes/nouveau" className="btn-primary text-sm">
            Créer la première ville
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#DBCAA8] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DBCAA8] bg-[#F2E8D5]">
                <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase tracking-wide">Ville</th>
                <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Maire</th>
                <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">Citoyens</th>
                <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">Projets</th>
                <th className="text-left px-5 py-3 text-[#6B8C6A] font-semibold text-xs uppercase tracking-wide">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr key={city.id} className="border-b border-[#DBCAA8] hover:bg-[#F2E8D5]/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                           style={{ background: `${city.accentColor ?? '#3A7A52'}18` }}>
                        🏙️
                      </div>
                      <div>
                        <div className="font-semibold text-[#1A3D2B]">{city.name}</div>
                        <div className="text-[10px] text-[#9AB09A]">/{city.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#6B8C6A] hidden md:table-cell">{city.mayor}</td>
                  <td className="px-5 py-3.5 text-[#6B8C6A] hidden lg:table-cell">{city._count.memberships}</td>
                  <td className="px-5 py-3.5 text-[#6B8C6A] hidden lg:table-cell">{city._count.projects}</td>
                  <td className="px-5 py-3.5">
                    {city.published ? (
                      <span className="inline-flex items-center gap-1 text-[#3A7A52] text-xs font-semibold">
                        <Eye size={11} /> Publiée
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#9AB09A] text-xs font-semibold">
                        <EyeOff size={11} /> Masquée
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/villes/${city.id}`}
                            className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A] hover:text-[#1A3D2B] transition-colors">
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => togglePublish(city)}
                        className="p-1.5 hover:bg-[#F2E8D5] rounded-lg text-[#6B8C6A] hover:text-[#1A3D2B] transition-colors"
                        title={city.published ? 'Masquer' : 'Publier'}
                      >
                        {city.published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(city)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-[#9AB09A] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
