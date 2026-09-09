import { useState } from 'react'
import api from '../services/api'

const initial = { name: '', email: '', phone: '', message: '' }

const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-800 shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/30'

export default function ContactForm() {
    const [form, setForm] = useState(initial)
    const [status, setStatus] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSubmitting) return
        setStatus(null)
        setIsSubmitting(true)
        try {
            await api.post('/api/contact/', form)
            setStatus({ type: 'success', message: 'Mensaje enviado. Te contactaremos pronto.' })
            setForm(initial)
        } catch (err) {
            setStatus({
                type: 'error',
                message: 'No pudimos enviar el mensaje. Revisá los datos e intentá nuevamente.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            {status && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`sm:col-span-2 rounded-lg p-3 text-sm ring-1 ${status.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        : 'bg-red-50 text-red-700 ring-red-200'
                        }`}
                >
                    {status.message}
                </div>
            )}

            <div>
                <label htmlFor="contact-name" className="text-sm font-medium text-slate-700">
                    Nombre
                </label>
                <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className={inputClass}
                />
            </div>

            <div>
                <label htmlFor="contact-email" className="text-sm font-medium text-slate-700">
                    Email
                </label>
                <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className={inputClass}
                />
            </div>

            <div className="sm:col-span-2">
                <label htmlFor="contact-phone" className="text-sm font-medium text-slate-700">
                    Teléfono <span className="font-normal text-slate-400">(opcional)</span>
                </label>
                <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    className={inputClass}
                />
            </div>

            <div className="sm:col-span-2">
                <label htmlFor="contact-message" className="text-sm font-medium text-slate-700">
                    Mensaje
                </label>
                <textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    minLength={10}
                    maxLength={8000}
                    rows="5"
                    className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-400">Mínimo 10 caracteres.</p>
            </div>

            <div className="sm:col-span-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-brand px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                </button>
            </div>
        </form>
    )
}
