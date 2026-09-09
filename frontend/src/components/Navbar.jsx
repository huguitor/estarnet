import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo_Nico.png'
import { IconArrowRight, IconMenu, IconX } from './Icons'

const navLink = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${isActive
    ? 'bg-sky-50 text-brand'
    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`

export default function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2" onClick={close}>
          <img src={logo} alt="Panozo Sistemas" className="h-9 w-auto object-contain sm:h-10" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
          <NavLink to="/" className={navLink} end>
            Inicio
          </NavLink>
          <NavLink to="/soluciones" className={navLink}>
            Soluciones
          </NavLink>
          <NavLink to="/contact" className={navLink}>
            Contacto
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-slate-500">{user.first_name || user.email}</span>
              <NavLink to="/dashboard" className={navLink}>
                Panel
              </NavLink>
              <button
                onClick={logout}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Ingresar
            </Link>
          )}
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
          >
            Hablemos de tu proyecto
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className="rounded-md p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
        >
          {open ? <IconX className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white px-4 pb-6 pt-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navegación móvil">
            <NavLink to="/" className={navLink} end onClick={close}>
              Inicio
            </NavLink>
            <NavLink to="/soluciones" className={navLink} onClick={close}>
              Soluciones
            </NavLink>
            <NavLink to="/contact" className={navLink} onClick={close}>
              Contacto
            </NavLink>
            {user ? (
              <>
                <NavLink to="/dashboard" className={navLink} onClick={close}>
                  Panel
                </NavLink>
                <button
                  onClick={() => {
                    logout()
                    close()
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLink} onClick={close}>
                  Ingresar
                </NavLink>
                <NavLink to="/register" className={navLink} onClick={close}>
                  Registrarse
                </NavLink>
              </>
            )}
            <Link
              to="/contact"
              onClick={close}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Hablemos de tu proyecto
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
