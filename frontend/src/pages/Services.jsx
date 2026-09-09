import { useEffect, useState } from 'react'
import api from '../services/api'
import ServiceCard from '../components/ServiceCard'
import { useAuth } from '../hooks/useAuth'

export default function Services() {
  const [publicServices, setPublicServices] = useState([])
  const [privateServices, setPrivateServices] = useState([])
  const { user } = useAuth()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/api/services/')
      .then((res) => setPublicServices(res.data))
      .catch(() => setError('No pudimos cargar los servicios.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user) return
    api.get('/api/services/private/')
      .then((res) => setPrivateServices(res.data))
      .catch(() => setPrivateServices([]))
  }, [user])

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Soluciones</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Servicios y soluciones</h1>
          <p className="mt-4 text-lg text-slate-600">
            Portafolio de capacidades y, para clientes con acceso, detalle privado con costos.
          </p>
        </div>

        {loading && <div className="mt-6 text-sm text-slate-500">Cargando servicios…</div>}

        {!loading && !error && publicServices.length === 0 && (
          <div className="mt-6 rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
            No hay servicios publicados por el momento.
          </div>
        )}

        {error && <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publicServices.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>

        {user && (
          <section className="mt-14">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-slate-900">Costos de servicios</h2>
              <span className="rounded-full bg-accent/20 px-2 py-1 text-xs font-semibold text-accent">Privado</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {privateServices.map((s) => (
                <ServiceCard key={s.id} service={s} showPrice />
              ))}
              {privateServices.length === 0 && (
                <p className="text-sm text-slate-600">No hay servicios con precios cargados aún.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
