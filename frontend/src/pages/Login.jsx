import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError('Credenciales inválidas')
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-100">
        <h2 className="text-2xl font-bold text-slate-900">Iniciar sesión</h2>
        <p className="text-sm text-slate-600">Accede al panel privado de clientes.</p>

        {error && <div className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded border border-slate-300 p-3 text-slate-800 focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-700">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded border border-slate-300 p-3 text-slate-800 focus:border-primary focus:outline-none"
            />
          </div>
          <button type="submit" className="w-full rounded bg-primary px-4 py-3 font-semibold text-dark hover:brightness-110">
            Entrar
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
