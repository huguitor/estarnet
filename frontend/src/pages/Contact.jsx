import { useState } from 'react'
import api from '../services/api'

const initial = { name: '', email: '', phone: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(initial)
  const [status, setStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    try {
      await api.post('/api/contact/', form)
      setStatus({ type: 'success', message: 'Mensaje enviado. Te contactaremos pronto.' })
      setForm(initial)
    } catch (err) {
      setStatus({ type: 'error', message: 'No pudimos enviar el mensaje. Revisa los datos.' })
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h2 className="text-3xl font-bold text-slate-900">Contacto</h2>
      <p className="text-slate-600">Completá el formulario y nuestro equipo te responderá.</p>

      {status && (
        <div
          className={`mt-4 rounded p-3 text-sm ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label className="text-sm text-slate-700">Nombre</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border border-slate-300 bg-white p-3 text-slate-800 focus:border-primary focus:outline-none"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="text-sm text-slate-700">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border border-slate-300 bg-white p-3 text-slate-800 focus:border-primary focus:outline-none"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="text-sm text-slate-700">Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="mt-1 w-full rounded border border-slate-300 bg-white p-3 text-slate-800 focus:border-primary focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-slate-700">Mensaje</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            minLength={10}
            className="mt-1 w-full rounded border border-slate-300 bg-white p-3 text-slate-800 focus:border-primary focus:outline-none"
            rows="5"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full rounded bg-primary px-4 py-3 font-semibold text-dark shadow hover:brightness-110"
          >
            Enviar mensaje
          </button>
        </div>
      </form>
    </div>
  )
}
