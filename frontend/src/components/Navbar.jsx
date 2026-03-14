import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo_Nico.png'

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium ${isActive ? 'text-primary' : 'text-slate-200 hover:text-white'}`

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-dark text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <img src={logo} alt="Panozo Sistemas" className="h-10 w-auto object-contain" />
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/services" className={linkClass}>
            Servicios
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contacto
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <span className="mx-2 text-sm text-slate-300">{user.first_name || user.email}</span>
              <button
                onClick={logout}
                className="rounded bg-slate-200 px-3 py-2 text-xs font-semibold text-dark hover:bg-white"
              >
                Salir
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="rounded border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-200 hover:text-dark"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded bg-primary px-3 py-2 text-xs font-semibold text-dark hover:brightness-110"
              >
                Registro
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
