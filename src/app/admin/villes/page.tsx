'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Eye, EyeOff, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { PublishedBadge } from '@/components/admin/AdminBadge'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'

interface City {
  id: string; name: string; slug: string; mayor: string
  biome: string | null; published: boolean; order: number
  accentColor: string | null
  _count: { memberships: number; projects: number; announcements: number }
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
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !city.published }),
    })
    toast.success(city.published ? 'Ville masquée' : 'Ville publiée')
    load()
  }

  async function handleDelete(city: City) {
    if (!confirm(`Supprimer "${city.name}" ? Irréversible.`)) return
    await fetch(`/api/cities/${city.id}`, { method: 'DELETE' })
    toast.success('Ville supprimée')
    load()
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Villes</h1>
          <p className="adm-page-subtitle">{cities.length} ville{cities.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/villes/nouveau" className="adm-btn adm-btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={14} /> Nouvelle ville
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map(i => <div key={i} className="adm-skeleton" style={{ height: 52, borderRadius: 8 }} />)}
        </div>
      ) : cities.length === 0 ? (
        <AdminEmptyState
          icon="🏙️"
          title="Aucune ville créée"
          desc="Créez la première ville pour commencer à peupler votre serveur."
          action={{ label: 'Créer une ville', href: '/admin/villes/nouveau' }}
        />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Ville</th>
                <th>Maire</th>
                <th>Citoyens</th>
                <th>Projets</th>
                <th>Statut</th>
                <th style={{ width: 100 }} />
              </tr>
            </thead>
            <tbody>
              {cities.map(city => (
                <tr key={city.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: `${city.accentColor ?? 'var(--adm-accent)'}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      }}>
                        🏙️
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--adm-text-1)' }}>{city.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--adm-text-3)' }}>/{city.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--adm-text-2)' }}>{city.mayor}</td>
                  <td style={{ color: 'var(--adm-text-2)' }}>{city._count.memberships}</td>
                  <td style={{ color: 'var(--adm-text-2)' }}>{city._count.projects}</td>
                  <td><PublishedBadge published={city.published} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <Link href={`/admin/villes/${city.id}`} className="adm-btn adm-btn-ghost adm-btn-sm">
                        <Pencil size={13} />
                      </Link>
                      <button onClick={() => togglePublish(city)} className="adm-btn adm-btn-ghost adm-btn-sm"
                              title={city.published ? 'Masquer' : 'Publier'}>
                        {city.published ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button onClick={() => handleDelete(city)} className="adm-btn adm-btn-danger adm-btn-sm">
                        <Trash2 size={13} />
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
