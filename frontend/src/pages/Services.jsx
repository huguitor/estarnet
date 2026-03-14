import { useEffect, useState } from 'react'
import api from '../services/api'
import ServiceCard from '../components/ServiceCard'
import { useAuth } from '../hooks/useAuth'

export default function Services() {
  const [publicServices, setPublicServices] = useState([])
  const [privateServices, setPrivateServices] = useState([])
  const { user } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/services/')
      .then((res) => setPublicServices(res.data))
      .catch(() => setError('No pudimos cargar los servicios.'))
  }, [])

  useEffect(() => {
    if (!user) return
    api.get('/api/services/private/')
      .then((res) => setPrivateServices(res.data))
      .catch(() => setPrivateServices([]))
  }, [user])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Servicios</h2>
          <p className="text-slate-600">Portafolio público y detalle privado con precios para clientes.</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {publicServices.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>

      {user && (
        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-2xl font-semibold text-slate-900">Costos de servicios</h3>
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
  )
}
