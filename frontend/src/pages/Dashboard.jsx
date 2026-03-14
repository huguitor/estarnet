import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const [services, setServices] = useState([])
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/api/services/private/')
      .then((res) => setServices(res.data))
      .catch(() => setError('No pudimos cargar el listado de costos.'))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Panel</p>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard de {user?.first_name || user?.email}</h2>
          <p className="text-slate-600">Costos de servicios y base para próximas novedades.</p>
        </div>
      </div>

      {error && <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow">
        <table className="min-w-full text-left text-sm text-slate-800">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Servicio</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Creado</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                <td className="px-4 py-3">{s.category}</td>
                <td className="px-4 py-3 font-medium text-accent">${s.price}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-slate-600" colSpan="4">
                  No hay costos cargados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
