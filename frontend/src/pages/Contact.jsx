import ContactForm from '../components/ContactForm'
import { IconClock, IconMail, IconMapPin, IconPhone } from '../components/Icons'

export default function Contact() {
  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Contacto</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Hablemos de tu proyecto
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Contanos qué necesitás mejorar, integrar o desarrollar. Podemos ayudarte a evaluar la
            solución adecuada.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Panozo Sistemas</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <IconMapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    Rosa Alaniz 470 (8300)
                    <br />
                    Neuquén Capital - Argentina
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <IconPhone className="h-5 w-5 shrink-0 text-primary" />
                  <a href="tel:+542995214846" className="hover:text-brand">
                    +54 2995214846
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <IconMail className="h-5 w-5 shrink-0 text-primary" />
                  <a href="mailto:panozoelectronica@gmail.com" className="hover:text-brand">
                    panozoelectronica@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <IconClock className="h-5 w-5 shrink-0 text-primary" />
                  Lunes a viernes, 9 a 18 h (ART)
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">¿Qué sigue después de escribirnos?</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Analizamos tu consulta, te contactamos y coordinamos una conversación para entender
                el proyecto y proponer el camino más adecuado.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">Completá el formulario</h2>
              <p className="mt-1 text-sm text-slate-600">Respondemos a la brevedad.</p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
