import { Link } from 'react-router-dom'
import { IconMail, IconMapPin, IconPhone } from './Icons'

export default function Footer() {
  return (
    <footer className="bg-dark text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="text-lg font-semibold text-white">Panozo Sistemas</p>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Software, infraestructura y soluciones conectadas para simplificar procesos y
              acompañar el crecimiento de tu empresa.
            </p>
          </div>

          <nav className="space-y-3" aria-label="Navegación del sitio">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Navegación</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="transition hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition hover:text-white">
                  Soluciones
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </nav>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Contacto</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                <span>
                  Rosa Alaniz 470 (8300)
                  <br />
                  Neuquén Capital - Argentina
                </span>
              </li>
              <li className="flex items-center gap-2">
                <IconPhone className="h-4 w-4 shrink-0 text-sky-400" />
                <a href="tel:+542995214846" className="transition hover:text-white">
                  +54 2995214846
                </a>
              </li>
              <li className="flex items-center gap-2">
                <IconMail className="h-4 w-4 shrink-0 text-sky-400" />
                <a href="mailto:panozoelectronica@gmail.com" className="transition hover:text-white">
                  panozoelectronica@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <nav className="space-y-3" aria-label="Enlaces legales">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Legal</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/politica-de-privacidad" className="transition hover:text-white">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terminos-y-condiciones" className="transition hover:text-white">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-slate-700/60 pt-6 text-center text-sm text-slate-400">
          <span>© 2026 Panozo Sistemas. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  )
}
