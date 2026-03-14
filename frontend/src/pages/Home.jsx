import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-sky-50 to-slate-100">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 lg:flex-row lg:items-center">
        <div className="space-y-6 lg:w-1/2">
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Conectamos ideas</p>
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            Soluciones digitales seguras para tu organización
          </h1>
          <p className="text-lg text-slate-700">
            Servicios de desarrollo, infraestructura y consultoría con enfoque en seguridad, escalabilidad y experiencia de usuario.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="rounded bg-primary px-5 py-3 font-semibold text-dark shadow hover:brightness-110">
              Agenda una demo
            </Link>
            <Link to="/services" className="rounded border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-white">
              Ver servicios
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2">
          <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-100">
            <h3 className="text-xl font-semibold text-slate-900">Por qué EstarNet</h3>
            <ul className="mt-4 space-y-3 text-slate-700">
              <li>✓ Arquitecturas listas para producción con mejores prácticas DevSecOps.</li>
              <li>✓ APIs seguras con JWT, rate limiting y hardening de cabeceras.</li>
              <li>✓ Frontends rápidos en React + Vite optimizados para SEO y accesibilidad.</li>
              <li>✓ Despliegues con Docker, Compose y Nginx listos para HTTPS.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
